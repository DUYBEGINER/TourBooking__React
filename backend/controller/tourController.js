const {sql, getPool} = require("../config/db");
const fs = require('fs').promises; // Thêm module fs để xử lý tệp
const path = require('path'); // Thêm module path để xử lý đường dẫn
const { insertItinerary, updateItinerary } = require("./scheduleController");
const { addTourPrice, updateTourPrice } = require("./tourPriceController");
const { uploadTourImage } = require("./imageController");


const updateStatusTour = async (transaction) => {
  try {
   
    // Cập nhật trạng thái Đã hoàn thành: end_date < hôm nay
    await transaction.request().query(`
      UPDATE Tour
      SET status = 'completed'
      WHERE end_date < GETDATE()
        AND status NOT IN ('inactive', 'reject','pending');
    `);

    // Cập nhật trạng thái Đang khởi hành: start_date <= hôm nay <= end_date
    await transaction.request().query(`
      UPDATE Tour
      SET status = 'ongoing'
      WHERE start_date <= GETDATE()
        AND end_date >= GETDATE()
        AND status NOT IN ('inactive', 'reject','pending');
    `);

    // Cập nhật trạng thái Sắp khởi hành: start_date từ hôm nay đến 7 ngày tới
    await transaction.request().query(`
      UPDATE Tour
      SET status = 'upcoming'
      WHERE start_date > GETDATE()
        AND start_date <= DATEADD(DAY, 7, GETDATE())
        AND status NOT IN ('inactive', 'reject','pending');
    `);

    // Cập nhật trạng thái Đã đủ chỗ: booked_slots >= max_guests
    await transaction.request().query(`
      WITH BookedSlots AS (
        SELECT 
          b.tour_id,
          ISNULL(SUM(bd.quantity), 0) AS booked_slots
        FROM Booking b
        INNER JOIN Booking_Detail bd
          ON b.booking_id = bd.booking_id
        WHERE b.status = 'confirmed'
        GROUP BY b.tour_id
      )
      UPDATE Tour
      SET status = 'fullbooked'
      FROM Tour t
      INNER JOIN BookedSlots bs ON bs.tour_id = t.tour_id
      WHERE bs.booked_slots >= t.max_guests
        AND t.status NOT IN ('inactive', 'reject', 'completed', 'ongoing', 'upcoming', 'fullbooked');
    `);

    // 6. Cập nhật trạng thái active: các tour còn lại
    // await transaction.request().query(`
    //   UPDATE Tour
    //   SET status = 'active'
    //   WHERE status NOT IN ('inactive', 'reject', 'invalid', 'completed', 'ongoing', 'upcoming', 'fullbooked');
    // `);

    console.log("Cập nhật trạng thái tour thành công");
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái tour:", error.message);
    throw new Error("Lỗi khi cập nhật trạng thái tour");
  }
};



//Lấy danh sách tất cả các tour (dành cho nhân viên tư vấn)
const getTour =  async (req, res) => {
  let transaction;
  try{
      // Lấy status và searchText từ query parameters
      const { status, search } = req.query;
      console.log("Status tour filter: ", status, "Search text:", search);
      const pool = await getPool();
      transaction = pool.transaction();
      await transaction.begin();
      // Cập nhật trạng thái tour trước khi lấy danh sách
      await updateStatusTour(transaction);
      // Xây dựng câu truy vấn SQL
      let query = `
        SELECT 
          t.tour_id,
          t.branch_id, 
          t.name, 
          t.destination,
          t.departure_location,
          t.start_date,
          t.end_date,
          t.max_guests,
          t.transport,
          t.created_at,
          t.description,
          t.duration,
          t.status,
          tp.age_group,
          tp.price,
          ISNULL((
            SELECT SUM(bd.quantity)
            FROM Booking b
            INNER JOIN Booking_Detail bd
            ON b.booking_id = bd.booking_id
            WHERE b.tour_id = t.tour_id 
            AND b.status = 'confirmed'
          ), 0) AS booked_slots
        FROM Tour AS t
        LEFT JOIN Tour_Price AS tp 
        ON t.tour_id = tp.tour_id
        WHERE t.status NOT IN ('inactive', 'reject', 'pending')
      `;

      // Tạo danh sách tham số cho truy vấn
      const request = transaction.request();
      // Thêm điều kiện lọc theo status
      if (status) {
        // Nếu status là chuỗi, ví dụ: 'active,Upcoming', chuyển thành mảng
        if (status === 'all') {
          query += ``; //Nếu lất tất cả thì không cần điều kiện
        } else {
          query += ` AND t.status = @status`;
          request.input('status', sql.NVarChar, status);
        }
      }

      // Thêm điều kiện tìm kiếm theo searchText
      if (search) {
        query += ` AND (t.name LIKE @searchText OR t.tour_id LIKE @searchText)`;
        request.input('searchText', sql.NVarChar, `%${search}%`);
      }
      // Thực thi truy vấn
      const result = await request.query(query);
      // Nhóm dữ liệu theo tour_id
      const toursMap = {};
      result.recordset.forEach((row) => {
        if (!toursMap[row.tour_id]) {
          toursMap[row.tour_id] = {
            tour_id: row.tour_id,
            branch_id: row.branch_id,
            name: row.name,
            destination: row.destination,
            departureLocation: row.departure_location,
            start_date: row.start_date,
            end_date: row.end_date,
            max_guests: row.max_guests,
            booked_slots: row.booked_slots, // Thêm số chỗ đã đặt
            available_seats: row.max_guests - row.booked_slots, // Tính số chỗ còn trống
            transport: row.transport,
            duration: row.duration,
            status: row.status,
            created_at: row.created_at,
            description: row.description,
            prices: [],  //prices này có 's'
          };
        }
        if (row.age_group && row.price !== null) {
          toursMap[row.tour_id].prices.push({
            age_group: row.age_group,
            price: row.price,
          });
        }
      });
      const tours = Object.values(toursMap);
      await transaction.commit();
      return res.status(200).json(tours);
    } catch (error) {
       // Rollback transaction nếu có lỗi
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Lỗi khi rollback transaction:', rollbackError.message);
            }
        }
        return res.status(500).json({error: error.message});
    }
}

//Lấy tour theo tỉnh
const getTourByProvince = async (req, res) => {
  const province = req.params.province;
  const limit = parseInt(req.query.limit) || 10; // Giới hạn số lượng tour trả về, mặc định là 10
  const cusId = req.query.cusId; // Lấy cusId từ query params nếu có
  // console.log("Get tours by province with param    efffefffs:", req.query);
  // console.log("Province:", province, "Limit:", limit);

  try {
    const pool = await getPool();
    let query;
    if (cusId) {
      // Nếu có cusId, lấy thêm thông tin yêu thích
      query = `
        WITH TOUR_SUBSET AS (
          SELECT * FROM Tour AS t WHERE t.destination LIKE @province AND t.status IN ('active', 'upcoming')
          ORDER BY t.created_at DESC
          OFFSET 0 ROWS
          FETCH NEXT @limit ROWS ONLY
        )
        SELECT ts.tour_id, ts.name, ts.destination, ts.start_date, ts.max_guests, ts.duration, tp.price,
        (SELECT TOP 1 image_url 
          FROM Tour_image ti 
          WHERE ti.tour_id = ts.tour_id 
          ORDER BY image_id ASC
        ) AS cover_image,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM Favorite_Tour ft 
            WHERE ft.tour_id = ts.tour_id AND ft.cus_id = @cusId
          ) THEN 1 
          ELSE 0 
        END AS is_favorite,
        (SELECT ft.fav_id 
           FROM Favorite_Tour ft 
           WHERE ft.tour_id = ts.tour_id AND ft.cus_id = @cusId) AS fav_id,
        ISNULL((
            SELECT SUM(bd.quantity)
            FROM Booking b
            INNER JOIN Booking_Detail bd
            ON b.booking_id = bd.booking_id
            WHERE b.tour_id = ts.tour_id 
            AND b.status = 'confirmed'
          ), 0) AS booked_slots
        FROM TOUR_SUBSET ts
        LEFT JOIN Tour_Price AS tp ON ts.tour_id = tp.tour_id AND tp.age_group = 'adultPrice'
      `;
    } else {
      // Nếu không có cusId, không lấy thông tin yêu thích
      query = `
        WITH TOUR_SUBSET AS (
          SELECT * FROM Tour AS t WHERE t.destination LIKE @province AND t.status IN ('active', 'upcoming')
          ORDER BY t.created_at DESC
          OFFSET 0 ROWS
          FETCH NEXT @limit ROWS ONLY
        )
        SELECT ts.tour_id, ts.name, ts.destination, ts.start_date, ts.max_guests, ts.duration, tp.price,
        (SELECT TOP 1 image_url 
          FROM Tour_image ti 
          WHERE ti.tour_id = ts.tour_id 
          ORDER BY image_id ASC
        ) AS cover_image,
        ISNULL((
          SELECT SUM(bd.quantity)
          FROM Booking b
          INNER JOIN Booking_Detail bd
          ON b.booking_id = bd.booking_id
          WHERE b.tour_id = ts.tour_id 
          AND b.status = 'confirmed'
        ), 0) AS booked_slots
        FROM TOUR_SUBSET ts
        LEFT JOIN Tour_Price AS tp ON ts.tour_id = tp.tour_id AND tp.age_group = 'adultPrice'
      `;
    }

    const result = await pool.request()
      .input('province', sql.NVarChar, `%${province}%`)
      .input('limit', sql.Int, limit)
      .input('cusId', sql.NVarChar, cusId || null) // Truyền cusId hoặc null
      .query(query);

    const toursMap = {};
    result.recordset.forEach((row) => {
      if (!toursMap[row.tour_id]) {
        toursMap[row.tour_id] = {
          tour_id: row.tour_id,
          name: row.name,
          destination: row.destination,
          start_date: row.start_date,
          max_guests: row.max_guests,
          duration: row.duration,
          price: row.price, //price không có 's'
          cover_image: row.cover_image || 'uploads\\default.jpg',

          booked_slots: row.booked_slots, // Thêm số chỗ đã đặt
          ...(cusId && {
              is_favorite: row.is_favorite === 1, // Chỉ thêm nếu có cusId
              fav_id: row.fav_id || null // Chỉ thêm nếu có cusId
          })
        };
      }
    });
    const tours = Object.values(toursMap);
    return res.status(200).json(tours);
  } catch (error) {
    console.log("Error fetching tours by province:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getTourOutstanding = async (req, res) => {
  const cusId = req.query.cusId; // Lấy cusId từ query params nếu có
  console.log("Get outstanding tours with cusId:", cusId);
  try {
    const pool = await getPool();

    let query;
    if (cusId) {
      query = `
          WITH TOUR_SUBSET AS (
          SELECT 
            t.tour_id, t.name, t.destination, t.start_date, t.max_guests, t.duration, tp.price
          FROM Tour AS t
          LEFT JOIN Tour_Price AS tp 
            ON t.tour_id = tp.tour_id AND tp.age_group = 'adultPrice'
          WHERE t.status IN ('active', 'upcoming')
          ORDER BY tp.price ASC
          OFFSET 0 ROWS
          FETCH NEXT 10 ROWS ONLY
        )
        SELECT 
          ts.tour_id, ts.name, ts.destination, ts.start_date, ts.max_guests, ts.duration, ts.price,
          (SELECT TOP 1 image_url 
            FROM Tour_image ti 
            WHERE ti.tour_id = ts.tour_id 
            ORDER BY image_id ASC
          ) AS cover_image,
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM Favorite_Tour ft 
              WHERE ft.tour_id = ts.tour_id AND ft.cus_id = @cusId
            ) THEN 1 
            ELSE 0 
          END AS is_favorite,
          (SELECT ft.fav_id 
            FROM Favorite_Tour ft 
            WHERE ft.tour_id = ts.tour_id AND ft.cus_id = @cusId
          ) AS fav_id,
            ISNULL((
              SELECT SUM(bd.quantity)
              FROM Booking b
              INNER JOIN Booking_Detail bd
              ON b.booking_id = bd.booking_id
              WHERE b.tour_id = ts.tour_id 
              AND b.status = 'confirmed'
            ), 0) AS booked_slots
        FROM TOUR_SUBSET ts
        `;
    } else {
        query = `
           WITH TOUR_SUBSET AS (
            SELECT 
              t.tour_id, t.name, t.destination, t.start_date, t.max_guests, t.duration, tp.price
            FROM Tour AS t
            LEFT JOIN Tour_Price AS tp 
              ON t.tour_id = tp.tour_id AND tp.age_group = 'adultPrice'
            WHERE t.status IN ('active', 'upcoming')
            ORDER BY tp.price ASC
            OFFSET 0 ROWS
            FETCH NEXT 10 ROWS ONLY
          )
          SELECT 
            ts.tour_id, ts.name, ts.destination, ts.start_date, ts.max_guests, ts.duration, ts.price,
            (SELECT TOP 1 image_url 
            FROM Tour_image ti 
            WHERE ti.tour_id = ts.tour_id 
            ORDER BY image_id ASC
            ) AS cover_image,
            ISNULL((
              SELECT SUM(bd.quantity)
              FROM Booking b
              INNER JOIN Booking_Detail bd
              ON b.booking_id = bd.booking_id
              WHERE b.tour_id = ts.tour_id 
              AND b.status = 'confirmed'
            ), 0) AS booked_slots
          FROM TOUR_SUBSET ts
        `;
    }

    const result = await pool.request()
      .input('cusId', sql.NVarChar, cusId || null) // Truyền cusId hoặc null
      .query(query);
        const toursMap = {};
        result.recordset.forEach((row) => {
          if (!toursMap[row.tour_id]) {
            toursMap[row.tour_id] = {
              tour_id: row.tour_id,
              name: row.name,
              destination: row.destination,
              start_date: row.start_date,
              max_guests: row.max_guests,
              duration: row.duration,
              price: row.price, //price không có 's'
              cover_image: row.cover_image || 'uploads\\default.jpg',
              booked_slots: row.booked_slots, // Thêm số chỗ đã đặt
              ...(cusId && {
              is_favorite: row.is_favorite === 1, // Chỉ thêm nếu có cusId
              fav_id: row.fav_id || null // Chỉ thêm nếu có cusId
          })
            };
          }
        }
      );
      const tours = Object.values(toursMap);
    return res.status(200).json(tours);
  }catch(error){
    return res.status(500).json({error: error.message });
  }
}


// Thêm tour mới
const createTour =  async (req, res) => {
    let transaction;
    try {
      const {
        tour_id,
        name,
        departureLocation,
        destination,
        duration,
        start_date,
        end_date,
        max_guests,
        transport,
        prices,
        description,
        branch_id,
        itinerary,
      } = req.body;
      
      console.log("req body: ",req.body);
      
      // Parse JSON strings từ FormData
      const parsedPrices = typeof prices === 'string' ? JSON.parse(prices) : prices;
      const parsedItinerary = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
      
      // Xử lý uploaded files
      const imagePaths = req.files ? req.files.map(file => file.path) : [];
      
      // Xác thực dữ liệu
      if (!tour_id || !name || !start_date || !end_date || !parsedPrices || parsedPrices.length === 0) {
        return res.status(400).json({ error: "Thiếu các trường bắt buộc: tour_id, name, start_date, end_date, prices" });
      }
      const createdAt = new Date(); // Lấy thời gian hiện tại
      const pool =  await getPool();

      transaction = pool.transaction();

      // Bắt đầu transaction
      await transaction.begin();
      const tourRequest = transaction.request();
      await tourRequest
        .input("tour_id", sql.NVarChar, tour_id)
        .input("branch_id", sql.Int, branch_id)
        .input("name", sql.NVarChar, name)
        .input("duration", sql.Int, duration)
        .input("destination", sql.NVarChar, destination)
        .input("departure_location", sql.NVarChar,  departureLocation)
        .input("start_date", sql.Date, start_date)
        .input("end_date", sql.Date, end_date)
        .input("description", sql.NVarChar, description)  
        .input("max_guests", sql.Int, max_guests)
        .input("transport", sql.NVarChar, transport)
        .input("created_at", sql.DateTime, createdAt)
        .input("status", sql.NVarChar, "pending")
        .query(`
          INSERT INTO Tour (tour_id, branch_id, name, duration, destination, departure_location, start_date, end_date, description, max_guests, transport, created_at, status)
          VALUES (@tour_id, @branch_id, @name, @duration, @destination, @departure_location, @start_date, @end_date, @description, @max_guests, @transport, @created_at, @status)
        `);
        //Nếu có ảnh mới, thêm ảnh mới vào csdl
        if (imagePaths.length > 0) {
          await uploadTourImage(transaction, tour_id, imagePaths);
        }
        
        if (parsedItinerary && parsedItinerary.length > 0) {
          await insertItinerary(transaction, tour_id, parsedItinerary);
        }

        await addTourPrice(transaction, tour_id, parsedPrices);
        await transaction.commit();

        return res.status(201).json({ message: "Thêm tour thành công" });
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      console.error("Lỗi khi thêm tour:", error);
      return res.status(500).json({ error: error.message });
    }
  }
  
const updateTour = async (req, res ) => {
  let transaction;
  const tourId = req.params.id;
  console.log("tourId: ", tourId);
  try{
    const {
      name,
      departureLocation,
      destination,
      duration,
      start_date,
      end_date,
      max_guests,
      transport,
      prices,
      description,
      branch_id,
      itinerary,
      existingImages,
    } = req.body;
   
    // Parse JSON strings từ FormData
    const parsedPrices = typeof prices === 'string' ? JSON.parse(prices) : prices;
    const parsedItinerary = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
    const parsedExistingImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
    console.log("parsedExistingImages ",parsedExistingImages);
    // Xử lý uploaded files
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    const pool = await getPool();
    transaction = pool.transaction();
    await transaction.begin();

    const updateTourRequest = transaction.request();
    await updateTourRequest
    .input("tour_id", sql.NVarChar, tourId)
    .input("branch_id", sql.Int, branch_id)
    .input("name", sql.NVarChar, name)
    .input("duration", sql.Int, duration)
    .input("destination", sql.NVarChar, destination)
    .input("departure_location", sql.NVarChar,  departureLocation)
    .input("start_date", sql.Date, start_date)
    .input("end_date", sql.Date, end_date)
    .input("description", sql.NVarChar, description)
    .input("max_guests", sql.Int, max_guests)
    .input("transport", sql.NVarChar, transport)
    .query(`
      UPDATE Tour
      SET branch_id = @branch_id, name = @name, duration = @duration, destination = @destination, departure_location = @departure_location, start_date = @start_date, end_date = @end_date, description = @description, max_guests = @max_guests, transport = @transport
      WHERE tour_id = @tour_id
    `);
    console.log("update tour request sucess")
    
    // Lấy danh sách đường dẫn ảnh cũ trước khi xóa
    const oldImagesResult = await transaction.request()
      .input("tour_id", sql.NVarChar, tourId)
      .query("SELECT * FROM Tour_image WHERE tour_id = @tour_id");

    const oldImagePaths = oldImagesResult.recordset.map(record => record.image_url);
    console.log("oldImagePaths: ", oldImagePaths);
    //Biến chứa những đường dẫn ảnh cũ khác với hiện tại, dùng để xóa ảnh cũ
    let imagesNeedDelete = oldImagePaths.filter(path => !parsedExistingImages.includes(path));
    

    if( imagesNeedDelete.length > 0){
      console.log("Có ảnh cũ cần xóa: ", imagesNeedDelete);
      const listImagesNeedDelete = imagesNeedDelete.map(path => `'${path}'`).join(",");
      // Xóa những ảnh cũ không còn trong parsedExistingImages
      await transaction.request()
        .input("tour_id", sql.NVarChar, tourId)
        .query(`DELETE FROM Tour_image WHERE tour_id = @tour_id AND image_url IN (${listImagesNeedDelete})`);

        // Xóa các tệp ảnh cũ trong thư mục uploads/
      for (const imagePath of imagesNeedDelete) {
        try {
          console.log("imagePath: ", imagePath);
          // Đảm bảo đường dẫn là tuyệt đối hoặc phù hợp với cấu trúc thư mục
          const fullPath = path.join(__dirname, '..', imagePath); // Điều chỉnh đường dẫn nếu cần
          console.log(`Đang xóa tệp ảnh: ${fullPath}`);
          await fs.unlink(fullPath); // Xóa tệp ảnh
          console.log(`Đã xóa tệp ảnh: ${fullPath}`);
        } catch (err) {
          console.warn(`Không thể xóa tệp ảnh ${imagePath}: ${err.message}`);
          // Không rollback transaction, chỉ ghi log lỗi
        }
      }
    }else{
      console.log("Không có ảnh cũ nào cần xóa"); 
    }

    // Nếu có ảnh mới, xóa ảnh cũ và thêm ảnh mới
    if (imagePaths.length > 0) {
      // Thêm ảnh mới
      if (imagePaths.length > 0) {
        await uploadTourImage(transaction, tourId, imagePaths);
      }
    }
    
    await updateItinerary(transaction, tourId, parsedItinerary);
    await updateTourPrice(transaction, tourId, parsedPrices);
    await transaction.commit();

    return res.status(200).json({ message: "Cập nhật tour thành công" });
  }catch(error){
    if (transaction) {
      await transaction.rollback();
    }
    console.error("Lỗi khi cập nhật tour:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Lấy chi tiết một tour theo ID
const getTourById = async (req, res) => {
  let transaction;
    try {
      const tourId = req.params.id;
      const pool = await getPool();
      transaction = pool.transaction(); 
      await transaction.begin();

      // Lấy thông tin tour
      const tourResult = await transaction.request()
      .input("tour_id", sql.NVarChar, tourId)
      .query("SELECT * FROM Tour WHERE tour_id = @tour_id");

      // Lấy thông tin giá tour
      const priceResult = await transaction.request()
      .input("tour_id", sql.NVarChar, tourId)
      .query("SELECT * FROM Tour_price WHERE tour_id = @tour_id");

      // Lọc giá cho từng loại
      const prices = priceResult.recordset || [];
      const adultPrice = prices.find(item => item.age_group === 'adultPrice')?.price || null;
      const childPrice = prices.find(item => item.age_group === 'childPrice')?.price || null;
      const infantPrice = prices.find(item => item.age_group === 'infantPrice')?.price || null;
      const tourWithPrice = {
        ...tourResult.recordset[0],
        adultPrice: adultPrice,
        childPrice: childPrice,
        infantPrice: infantPrice
      };
      await transaction.commit();
      // console.log("tourResult: ", tourWithPrice);
      res.status(200).json(tourWithPrice);
    } catch (error) {
       if (transaction) {
          await transaction.rollback();
        }
      res.status(500).json({ error: error.message  });
    }
  }

// Cập nhật trạng thái tour
const blockTour = async (req, res) => {
  try {
    // Lấy tour_id từ tham số URL
    const tourId = req.params.id;
    const pool = await getPool();
    const result = await pool.request()
      .input("tour_id", sql.NVarChar, tourId)
      .query("UPDATE Tour SET status = 'inactive' WHERE tour_id = @tour_id");

    console.log("Rows affected:", result.rowsAffected);

    if (result.rowsAffected[0] > 0) {
      res.json({ message: "Khóa tour thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy tour" });
    }
  } catch (error) {
    console.error("Lỗi khi khóa tour:", error);
    res.status(500).send({ error: error.message  });
  }
}

// Khóa nhiều tour cùng lúc
const blockBatchTour = async (req, res) => {
  let transaction;
  try{
    const {tour_ids} = req.body; //Danh sách tour_id từ body
    if (!tour_ids || !Array.isArray(tour_ids) || tour_ids.length === 0) {
      return res.status(400).json({ message: "Danh sách ID không hợp lệ" });
    }    
    const pool = await getPool();
    transaction = pool.transaction();
    await transaction.begin();

    //Chuyển danh sách tour_ids thành chuỗi để truy vấn
    const tourIdsString = tour_ids.map(id => `'${id}'`).join(", ");
    const result = await transaction.request()
      .input("tour_ids", sql.NVarChar, tourIdsString)
      .query(`UPDATE Tour SET status = 'inactive' WHERE tour_id IN (${tourIdsString})`); //Chưa bảo mật SQL Injection
    await transaction.commit();
    return res.status(200).json({ message: `Đã khóa ${result.rowsAffected[0]} tour` });
  }catch (error){
    console.error("Lỗi khi khóa tour:", error);
    if (transaction) {
      await transaction.rollback();
    }
    return res.status(500).json({ error: error.message });
  }
}

// Lấy tour theo bộ lọc, dùng cho user
const getTourByFilter = async (req, res) => {
    try{
      const { name, destination, departure, budget, date} = req.query;
      console.log("Filter body: ", req.query);

      let whereClause = [];
      const params = [];

      // Thêm điều kiện bắt buộc
      whereClause.push('t.status IN (@status1, @status2)');
      params.push({ name: 'status1', type: sql.NVarChar, value: 'active' });
      params.push({ name: 'status2', type: sql.NVarChar, value: 'upcoming' });

      // Thêm điều kiện bắt buộc cho age_group
      whereClause.push('tp.age_group = @ageGroup');
      params.push({ name: 'ageGroup', type: sql.NVarChar, value: 'adultPrice' });

      if( name && name.trim() !== "") {
        whereClause.push("t.name LIKE @name");
        params.push({ name: 'name', type: sql.NVarChar, value: `%${name}%` });
      }


      if( destination && destination.trim() !== "") {
        whereClause.push("t.destination LIKE @destination");
        params.push({ name: 'destination', type: sql.NVarChar, value: `%${destination}%` });
      }

      if( departure && departure.trim() !== "") {
        whereClause.push("t.departure_location LIKE @departure");
        params.push({ name: "departure", type: sql.NVarChar, value: `%${departure}%` });
      }


      // Thêm điều kiện cho budget (sử dụng bảng tour_price)
      if (budget && budget.trim() !== '') {
        const budgetRanges = {
          'under-5m': { condition: 'tp.price < 5000000', param: 5000000 },
          '5m-10m': { condition: 'tp.price >= 5000000 AND tp.price < 10000000', param: [5000000, 10000000] },
          '10m-20m': { condition: 'tp.price >= 10000000 AND tp.price < 20000000', param: [10000000, 20000000] },
          'over-20m': { condition: 'tp.price >= 20000000', param: 20000000 },
        };


        const budgetConfig = budgetRanges[budget];
        
        if (budgetConfig) {
          whereClause.push(`(${budgetConfig.condition})`);
          if (Array.isArray(budgetConfig.param)) {
            params.push({ name: 'minPrice', type: sql.Decimal(15, 2), value: budgetConfig.param[0] });
            params.push({ name: 'maxPrice', type: sql.Decimal(15, 2), value: budgetConfig.param[1] });
          } else {
            params.push({ name: 'priceThreshold', type: sql.Decimal(15, 2), value: budgetConfig.param });
          }
        }
      }

      if( date && date.trim() !== "") {
        whereClause.push("t.start_date = @startDate");
        params.push({ name: 'startDate', type: sql.Date, value: new Date(date) });
      }

      // Xây dựng truy vấn SQL với JOIN
    let query = `
      SELECT t.tour_id, t.branch_id, t.name, t.duration, t.destination, t.departure_location, 
             t.start_date, t.end_date, t.description, t.max_guests, t.transport, 
             t.created_at, t.status, tp.price, 
        (SELECT TOP 1 image_url 
          FROM Tour_image ti 
          WHERE ti.tour_id = t.tour_id 
          ORDER BY image_id ASC
        ) AS cover_image,
        ISNULL((
          SELECT SUM(bd.quantity)
          FROM Booking b
          INNER JOIN Booking_Detail bd
          ON b.booking_id = bd.booking_id
          WHERE b.tour_id = t.tour_id 
          AND b.status = 'confirmed'
        ), 0) AS booked_slots
      FROM Tour t
      LEFT JOIN tour_price tp ON t.tour_id = tp.tour_id 
    `;
    
    if (whereClause.length > 0) {
      query += ' WHERE ' + whereClause.join(' AND ');
    }

    // Thực thi truy vấn
    const pool = await getPool();
    let request = pool.request();
    params.forEach(param => {
      if (Array.isArray(param.value)) {
        request.input(param.name + 'Min', param.type, param.value[0]);
        request.input(param.name + 'Max', param.type, param.value[1]);
      } else {
        request.input(param.name, param.type, param.value);
      }
    });

    let result = await request.query(query);
    const tours = result.recordset;

    console.log("Tours found: ", tours.length);
    return res.status(200).json({
      tours: tours,
      count: tours.length,
    });
    }catch(e){
        console.error("Lỗi khi lấy tour theo bộ lọc:", e);
        return res.status(500).json({ error: e.message });
    }
}

  module.exports = {
    getTour,
    createTour, 
    getTourById,
    getTourByFilter, 
    blockTour, 
    blockBatchTour, 
    updateTour, 
    getTourByProvince, 
    getTourOutstanding
};
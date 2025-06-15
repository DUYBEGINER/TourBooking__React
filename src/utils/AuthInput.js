const authInputs = {
    register: [
        {
            id: 1,
            name: "username",
            type: "text",
            placeholder: "Nhập họ và tên",
            errorMessage: {
                Default: "Họ và tên không được để trống",
                Constraint: "Họ và tên không chứa kí tự đặc biệt hoặc số"
            },
            label: "Nhập họ và tên",
            required: true,
            usepattern: true,
        },
        {
            id: 2,
            name: "phone",
            type: "text",
            placeholder: "Nhập số điện thoại",
            errorMessage: {
                Default: "Số điện thoại không được để trống",
                Constraint: "Vui lòng nhập đúng định dạng số điện thoại"
            },
            label: "Nhập số điện thoại",
            required: true,
            usepattern: true,
        },
        {
            id: 3,
            name: "email",
            type: "text",
            placeholder: "Email",
            errorMessage: {
                Default: "Email không được để trống",
                Constraint: "Email không hợp lệ"
            },
            label: "Email",
            required: true,
            usepattern: true,

        },
        {
            id: 4,
            name: "birthday",
            type: "date",
            placeholder: "Ngày sinh",
            errorMessage: {
                Default: "Ngày sinh không được để trống",
                Constraint: "Ngày sinh không hợp lệ"
            },
            label: "Ngày sinh",
            required: true,
            usepattern: false,
        },
        {
            id: 5,
            name: "password",
            type: "password",
            placeholder: "Nhập mật khẩu",
            errorMessage: {
                Default: "Mật khẩu không được để trống",
                Constraint: "Mật khẩu chứa ít nhất 8 kí từ và ít nhất một chữ cái, một số và một kí tự đặc biệt "
            },
            label: "Nhập mật khẩu",
            required: true,
            usepattern: true,
        },
        {
            id: 6,
            name: "confirmPassword",
            type: "password",
            placeholder: "Nhập lại mật khẩu",
            errorMessage: {
                Default: "Mật khẩu không được để trống",
                Constraint: "Mật khẩu không khớp"
            },
            label: "Nhập lại mật khẩu",
            required: true,
            usepattern: true,
        },
    ],
    login: [
        {
            id: 1,
            name: "email",
            type: "text",
            placeholder: "Nhập email",
            label: "Nhập email",
            errorMessage: {},
            required: true,
        },
        {
            id: 2,
            name: "password",
            type: "password",
            placeholder: "Nhập mật khẩu",
            label: "Nhập mật khẩu",
            errorMessage: {},
            required: true,
        },
    ]
};

export default authInputs;

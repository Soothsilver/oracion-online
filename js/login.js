// Provides language information to the fm.validator.jquery plugin for the login form.
// All Javascript validation is handled by that plugin.

Validator.languages.cs = {
    textbox : {
        required: 'Toto pole je povinné.',
        min: "Toto pole musí obsahovat alespoň 5 znaků.",
        email: "Toto pole musí obsahovat emailovou adresu."
    },
    password : {
        required: 'Toto pole je povinné.',
        min: "Toto pole musí obsahovat alespoň 5 znaků.",
        match: "Hesla se neshodují."
    }
};
Validator.language = 'cs';
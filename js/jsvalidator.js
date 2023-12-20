class JSValidator {

    status = true;
    errors = [];
    via = 'http';
    validators = {
        minLength: 3,
        maxLength: 255,
    };

    msgs = {
        required: `Este campo es requerido.`,
        minLength: `Longitud no valida __minLength__ caracteres.`,
        maxLength: `Longitud no valida __maxLength__ caracteres.`,
        email: `El campo de email no es valido.`,
        integer: `El campo no es un número entero.`,
        alphanumeric: `El campo solo permite letra y números sin espacios.`,
        url: `La url no es valida.`,
    };



    constructor(formId) {
        this.setForm(formId);
        this.setInputs();
        this.parseInputs();
    }

    setForm(formId) {
        this.form = document.getElementById(formId);
    }

    setInputs() {
        this.inputs = document.querySelectorAll(`#${this.form.id} .jsValidator`);
    }

    setAjax() {

        this.via = 'ajax';

        return this;
    }

    setHttp() {

        this.via = 'http';

        return this;
    }

    parseInputs() {
        this.inputs.forEach(input => {
            this.appendErrorTag(input);
        });
    }

    appendErrorTag(input) {
        let parent = input.parentNode;
        let span = document.createElement('span');

        span.setAttribute("class", "error-msg");
        parent.appendChild(span);
    }

    validateForm() {
        this.form.addEventListener('submit', (e) => {

            //Reiniciar los errores y cambiar status a true
            this.resetValidation();

            //Recorrer cada uno de los inputs
            this.inputs.forEach(input => {

                //Validar cada input
                this.validateInput(input);
            });

            if (!this.status) {
                //Prevenir el envio del formulario
                e.preventDefault();

                console.log('Se muestran errores');
            } else {
                //Evaluar si se debe de enviar por ajax o http
                if (this.via === 'ajax') {
                    e.preventDefault();

                    this.submitHandler();

                } else {

                    //Solo para fines demostrativos
                    e.preventDefault();
                    console.log('error');

                }
            }
        });
    }

    validateInputs() {

        this.inputs.forEach(input => {

            input.addEventListener('input', (e) => {

                this.resetValidation();

                this.validateInput(input);
            });
        });
    }

    validateInput(input) {
        let validators = input.dataset.validators;

        if (validators !== undefined) {
            validators = validators.split(' ');

            validators.forEach(validator => {

                /**
                 * Si el validador es required => su metodo de validción seria _required(input)
                 */
                this[`_${validator}`](input);
            });
        }
    }

    setError(input, msg) {

        // Cambiando el valor del status
        this.status = false;

        this.setStackError(input, msg);

        this.setErrorMessage(input, msg);

    }

    setStackError(input, msg) {
        //Añadir el error al stack de errores
        this.errors.push({ input: input, msg: msg });
    }

    setErrorMessage(input, msg) {
        //Adjuntando el error
        let span = input.nextElementSibling;
        span.innerHTML += (msg + '<br />');
    }

    resetValidation() {
        //Cambiamos el valor de status
        this.status = true;

        this.resetStackError();

        this.resetErrorMessages();

    }

    resetStackError() {
        //Reestablece la pila de errores
        this.errors = [];
    }

    resetErrorMessages() {
        // Mostrar mensaje de error
        let spans = document.querySelectorAll(`#${this.form.id} .error-msg`);
        spans.forEach(span => {
            span.innerHTML = "";
        });
    }

    submitHandler() {
        let data = new FormData(this.form);

        fetch(this.form.action, {
            method: this.form.method,
            body: data
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('ERROR:' + error);
            });
    }

    init() {
        this.validateForm();

        this.validateInputs();

        return this;
    }
}



JSValidator.prototype._required = function (input) {

    let value = input.value;

    let msg = this.msgs.required;

    if (value.trim() === "" || value.length < 1) {
        this.setError(input, msg)
    }
}

JSValidator.prototype._length = function (input) {

    let value = input.value;

    let inputLength = value.length;

    let minLength = (input.dataset.validators_minlength != undefined) ?
        Number(input.dataset.validators_minlength) : this.validators.minLength;

    let maxLength = (input.dataset.validators_maxlength != undefined) ?
        Number(input.dataset.validators_maxlength) : this.validators.maxLength;

    let msg;

    if (inputLength < minLength) {
        msg = this.msgs.minLength.replace('__minLength__', minLength);

        this.setError(input, msg);
    }

    if (inputLength > maxLength) {
        msg = this.msgs.maxLength.replace('__maxLength__', maxLength);

        this.setError(input, msg);
    }

}


JSValidator.prototype._email = function (input) {

    let value = input.value;

    let msg = this.msgs.email;

    let pattern = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i);

    if (!pattern.test(value) && value.trim() != "") {

        this.setError(input, msg);

    }
}

JSValidator.prototype._integer = function (input) {

    let value = input.value;

    let msg = this.msgs.integer;

    let pattern = new RegExp(/^[0-9]+$/);

    if (!pattern.test(value) && value.trim() != "") {

        this.setError(input, msg);

    }
}

JSValidator.prototype._alphanumeric = function (input) {

    let value = input.value;

    let msg = this.msgs.alphanumeric;

    let pattern = new RegExp(/^[a-zA-Z0-9]+$/);

    if (!pattern.test(value) && value.trim() != "") {

        this.setError(input, msg);

    }
}


JSValidator.prototype._url = function (input) {

    // En primer lugar vamos a recuperar el valor del input
    let value = input.value;

    // Definir el mensaje de error
    let msg = this.msgs.url;

    // expresión regular para validar url
    var pattern = new RegExp(/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);

    // En caso de que la validación falle mandar error.
    if (!pattern.test(value) && value.trim() != "") {

        this.setError(input, msg);

    }

};

JSValidator.prototype._host = function (input) {

    // En primer lugar vamos a recuperar el valor del input
    let value = input.value; // Definir el mensaje de error

    let msg = this.msgs.host; // expresión regular para validar url

    var pattern = new RegExp(/^(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i); // En caso de que la validación falle mandar error.

    if (!pattern.test(value) && value.trim() != "") {

        this.setError(input, msg);

    }

};

JSValidator.prototype._password_confirmation = function (input) {

    // En primer lugar vamos a recuperar el valor del input
    let value = input.value;

    // Vamos a crear un arreglo de inputs con el valor password
    let password_inputs = [];

    // Encontrar un input con el nombre contraseña
    this.inputs.forEach(input => {

        if (input.name == "password") password_inputs.push(input);

    });

    if (password_inputs.length == 0) {

        this.setError(input, "No se ha encontrado un campo de contraseña para validar");

    } else {

        let password_input = password_inputs[0];

        if (password_input.value != value) {

            this.setError(input, "Los campos de contraseña no coinciden");

        }

    }

};

JSValidator.prototype._checked = function (input) {

    let msg = "Debes marcar esta casilla para continuar"; // expresión regular para validar integer

    if (!input.checked) {

        this.setError(input, msg);

    }

};
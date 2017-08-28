/**
 * (c) Aanand Kainth 2017
 */
/**
 * Create a new Formr
 * @param {HTMLFormElement} context
 * @constructor
 */
const Formr = function(context) {
    /**
     * The Formr context
     * @type {HTMLFormElement}
     */
    this.context = context;
};

Formr._preventRedirect = function(e) {
    e.preventDefault();
};

/**
 * Parse each element of the Formr, and if it has a name attribute, add its value to the returned string.
 * @return {String} A URI that can be passed to a server
 */
Formr.prototype.getFormData = function() {
    return new FormData(this.context);
};

/**
 * Add an event listener to the Formr context
 * @param {String} event The event to listen for
 * @param {Function} callback Called when event occurs
 */
Formr.prototype.on = function(event, callback) {
    this.context.addEventListener(event, callback);
};

/**
 * Prevent submission on the form
 * @param {Boolean} [ajax = true] Call event.preventDefault() on the submit event
 */
Formr.prototype.useAJAX = function(ajax) {
    if (ajax === null || ajax === undefined) {ajax = true;}
    if (ajax === true) {
        this.context.addEventListener('submit', Formr._preventRedirect);
    } else {
        this.context.removeEventListener('submit', Formr._preventRedirect);
    }
};
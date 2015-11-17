 if (typeof module != 'undefined' && module.exports) {
        module.exports = myDatabase;
    } else {
        window.myDatabase = myDatabase;
    }
})(window, document, Math);
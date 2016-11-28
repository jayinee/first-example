/* global define */

(function (root, init) {
    /**
     * Determines the runtime environment.
     */
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = init();
    } else if (typeof define === 'function' && define.amd) {
        define([], init);
    } else if (typeof exports === 'object') {
        exports.validator = init();
    } else {
        root.validator = init();
    }
})(this, function () {
    /* ---- Utility Functions ----- */

    /**
     * A function checks if the input is a number.
     *
     * @param  {String}  num
     * @return {Boolean}     Returns true if the input is a number.
     */
    function isNumber(num) {
        const type = typeof num;
        if (type !== 'number' && type !== 'string') {
            return false;
        }
        let n = +num; //eslint-disable-line
        return (n - n + 1) >= 0 && num !== '';
    }

    /**
     * A function that generates all combination of an array.
     *
     * @param  {Array} arr
     * @return {Array}     An array with all possible combination.
     */
    function combination(arr) {
        const result = [];
        function recur(prefix, arr) {
            for (let i = 0; i < arr.length; i++) {
                result.push(prefix + arr[i]);
                recur(prefix + arr[i], arr.slice(i + 1));
            }
        }
        recur('', arr);
        return result;
    }

    /**
     * A function that replaces dash/hypen to spaces.
     *
     * @param  {String} str String that contains dash/hypen.
     * @return {String}     A string with all dash converted to spaces.
     */
    function dashToSpace(str) {
        const dash = ['-'];
        let norm = '';
        for (let i = 0; i < str.length; i++) {
            if (dash.indexOf(str[i]) === -1) {
                norm += str[i];
            } else {
                norm += ' ';
            }
        }
        return norm;
    }

    /* ---------------VALIDATOR LIBRARY FUNCTIONS------------------ */

    /**
     * A function to determine whether the input is a valid email address.
     *
     * @param  {String}  input The email adress to be checked.
     * @return {Boolean}
     */
    function isEmailAddress(input) {
        if (input.indexOf('@') === -1 || input.indexOf('.') === -1) {
            return false;
        }
        const at = input.indexOf('@');
        const dot = input.lastIndexOf('.');
        return input.length > 0 &&
            at > 0 &&
            dot > at &&
            input[at + 1] !== '.' &&
            input.indexOf(' ') === -1 &&
            input.indexOf('..') === -1;
    }

    /**
     * A function to determine whether the input is a valid Malaysian phone number.
     * This function ignore exit codes for now.
     *
     * @param  {String}  input The phone number to be checked.
     * @return {Boolean}
     */
    function isPhoneNumber(input) {
        const disallow = ['+', '(', ')', '-', ' '];
        let arr = input.toString().split('')
            .filter(el => {
                return disallow.indexOf(el) === -1;
            });
        for (let value of arr) {
            if (!isNumber(value)) {
                return false;
            }
        }
        if (arr.length === 10) {
            if (arr[0] === '1') {
                const pub = arr[1] + arr[2] + arr[3];
                return pub === '800' || pub === '300';
            } else if (arr[0] === '0') {
                const pub = arr[1];
                return pub === '3' || pub === '1';
            }
        }
        return false;
    }

    /**
     * A function that removes all symbols and punctuation from an input.
     *
     * @param  {String} input The input string containing symbols or punctuation.
     * @return {String}       The resulting string free from symbols and punctuation.
     */
    function withoutSymbols(input) {
        const disallow = '[&\/\\#,+\(\)$~%\.!^\'"\;:*?\[\]<>{}@]';
        return input.split('').filter(el => {
            return disallow.indexOf(el) === -1;
        }).join('');
    }

    /**
     * A function to determine whether the input is a valid date.
     *
     * @param  {String or Date Object}
     * @return {Boolean}
     */
    function isDate(input) {
        const date = new Date(input);

        return Boolean(date) &&
            typeof date === 'object' &&
            Object.prototype.toString.call(date) === '[object Date]' &&
            !isNaN(date.getMonth());
    }

    /**
     * A function to determine whether an input date is before a reference date.
     *
     * @param  {String or Date Object}  input
     * @param  {String or Date Object}  reference Reference date.
     * @return {Boolean}
     */
    function isBeforeDate(input, reference) {
        if (!isDate(input) || !isDate(reference)) {
            throw new TypeError('Invalid Date Object');
        }
        return new Date(reference) > new Date(input);
    }

    /**
     * A function to determine whether an input date is after a reference date.
     *
     * @param  {String or Date Object}  input
     * @param  {String or Date Object}  reference Reference date.
     * @return {Boolean}
     */
    function isAfterDate(input, reference) {
        return !isBeforeDate(input, reference);
    }

    /**
     * A function to determine whether an input date is before today.
     * (i.e. the day the function is invoked)
     *
     * @param  {String or Date Object}  input
     * @return {Boolean}
     */
    function isBeforeToday(input) {
        if (!isDate(input)) {
            throw new TypeError('Invalid Date Object');
        }
        return new Date() > new Date(input);
    }

    /**
     * A function to determine whether an input date is after today.
     * (i.e. the day the function is invoked)
     *
     * @param  {String or Date Object}  input
     * @return {Boolean}
     */
    function isAfterToday(input) {
        return !isBeforeToday(input);
    }

    /**
     * A function to check whether a string is an empty string.
     * @param  {String}  input The input string.
     * @return {Boolean}
     */
    function isEmpty(input) {
        if (input === undefined || input === null) {
            return false;
        }
        var norm = input.trim();
        return norm.length === 0 || input === ' ';
    }

    /**
     * A function to determine whether the input string contains at least one word from the given array.
     *
     * @param  {String} input The input string.
     * @param  {Array} words An array containing words for the input string to check against.
     * @return {Boolean}
     */
    function contains(input, words) {
        const arr = dashToSpace(input).split(' ')
            .map(i => {
                return withoutSymbols(i).toLowerCase();
            });
        for (var i = 0; i < words.length; i++) {
            if (arr.indexOf(words[i].toLowerCase()) !== -1) {
                return true;
            }
        }
        return false;
    }

    /**
     * The inverse of .contains
     * @param  {String} input The input string.
     * @param  {Array} words An array containing words for the input string to check against.
     * @return {Boolean}
     */
    function lacks(input, words) {
        return !contains(input, words);
    }

    /**
     * A function to determine whether the input string is composed of the words contained in the given strings array.
     * @param  {String}  input   The input string.
     * @param  {Array}  strings An array containing words for the input string to check against.
     * @return {Boolean}         [description]
     */
    function isComposedOf(input, strings) {
        const norm = dashToSpace(withoutSymbols(input));
        let arr = norm.split(' ');
        if (arr.length === 1) {
            const combi = combination(strings);
            if (combi.indexOf(norm) !== -1) {
                return true;
            }

            arr = norm.split('');
            for (let value of arr) {
                if (strings.indexOf(value) === -1) {
                    return false;
                }
                return true;
            }
        }
        if (arr.length > 1) {
            for (let value of arr) {
                if (strings.indexOf(value) === -1) {
                    return false;
                }
            }
            return true;
        }
    }

    /**
     * Checks whether the input string is less than or equal to the given length.
     *
     * @param  {String}  input The string input.
     * @param  {Number}  n     The number input.
     * @return {Boolean}       [description]
     */
    function isLength(input, n) {
        return input.length <= n;
    }

    /**
     * Checks whether the input string is greater than or equal to the given length.
     *
     * @param  {String}  input The string input.
     * @param  {Number}  n     The number input.
     * @return {Boolean}       [description]
     */
    function isOfLength(input, n) {
        return input.length >= n;
    }

    /**
     * A function to count the number of words from the given input.
     *
     * @param  {String} input The string input.
     * @return {Number}       The number of words in the given string.
     */
    function countWords(input) {
        const puncs = ['\'', '(', ')', ':', ',', '!', '.', '-', '?', ';', '"', undefined, ' '];
        let norm = '';
        for (let i = 0; i < input.length; i++) {
            if (puncs.indexOf(input[i]) > 0) {
                norm += ' ';
            } else {
                norm += input[i];
            }
        }
        return norm.split(' ').filter(i => {
            if (i) {
                return true;
            }
            return false;
        }).length;
    }

    /**
     * Checks if the input string has a word count less than or equal to the given word count (n).
     *
     * @param  {String} input The string input.
     * @param  {Number} n     The word count.
     * @return {Boolean}
     */
    function lessWordsThan(input, n) {
        return countWords(input) <= n;
    }

    /**
     * Checks if the input string has a word count greater than or equal to the given word count (n).
     *
     * @param  {String} input The string input.
     * @param  {Number} n     The word count.
     * @return {Boolean}
     */
    function moreWordsThan(input, n) {
        return countWords(input) >= n;
    }

    /**
     * Checks whether the input number is between the given floor number and ceiling number.
     *
     * @param  {Number}  input The input number.
     * @param  {Number}  floor The floor number.
     * @param  {Number}  ceil  The ceiling number.
     * @return {Boolean}
     */
    function isBetween(input, floor, ceil) {
        return input >= floor && input <= ceil;
    }

    /**
     * Checks whether the given input contains only alphanumeric characters.
     *
     * @param  {String}  input The string input.
     * @return {Boolean}
     */
    function isAlphanumeric(input) {
        const dictionary = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
        for (let i = 0; i < input.length; i++) {
            if (dictionary.indexOf(input[i]) === -1) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if the given string input is a credit card or bank number.
     *
     * @param  {String}  input The string containing credit card or bank number information.
     * @return {Boolean}
     */
    function isCreditCard(input) {
        if (input.length > 19) {
            return false;
        }
        const hypen = ['-'];
        let norm = '';
        for (let i = 0; i < input.length; i++) {
            if (hypen.indexOf(input[i]) === -1) {
                norm += input[i];
            }
        }
        if (norm.length !== 16) {
            return false;
        }
        return isAlphanumeric(norm);
    }

    /**
     * A function to check whether the given string input is a valid CSS hexadecimal color.
     *
     * @param  {String}  input The hexadecimal string input.
     * @return {Boolean}
     */
    function isHex(input) {
        if (input[0] !== '#') {
            return false;
        }
        const hash = ['#'];
        let norm = '';
        for (let i = 0; i < input.length; i++) {
            if (hash.indexOf(input[i]) === -1) {
                norm += input[i];
            }
        }
        if (norm.length !== 6 && norm.length !== 3) {
            return false;
        }
        const dictionary = '0123456789abcdef'.split('');
        for (let i = 0; i < norm.length; i++) {
            if (dictionary.indexOf(norm[i].toLowerCase()) === -1) {
                return false;
            }
        }
        return true;
    }

    /**
     * A function to check whether the given string input is a valid CSS RGB color.
     *
     * @param  {String}  input The RGB color string input.
     * @return {Boolean}
     */
    function isRGB(input) {
        const inputToLower = input.toLowerCase();
        const rgb = 'rgb()';
        const dictionary = rgb.split('');
        let norm = '';
        let syntaxCheck = '';
        for (let i = 0; i < inputToLower.length; i++) {
            if (dictionary.indexOf(inputToLower[i]) === -1) {
                norm += inputToLower[i];
            } else {
                syntaxCheck += inputToLower[i];
            }
        }
        if (syntaxCheck !== rgb) {
            return false;
        }
        norm = norm.split(',').map(i => {
            return i.trim();
        });
        if (norm.length !== 3) {
            return false;
        }
        for (let num of norm) {
            if (parseInt(num, 10) > 255 || parseInt(num, 10) < 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * A function to check whether the given string input is a valid CSS HSL color.
     *
     * @param  {String}  input The HSL color string input.
     * @return {Boolean}
     */
    function isHSL(input) {
        const inputToLower = input.toLowerCase();
        const hsl = 'hsl()';
        const dictionary = hsl.split('');
        let norm = '';
        let syntaxCheck = '';
        for (let i = 0; i < inputToLower.length; i++) {
            if (dictionary.indexOf(inputToLower[i]) === -1) {
                norm += inputToLower[i];
            } else {
                syntaxCheck += inputToLower[i];
            }
        }
        if (syntaxCheck !== hsl) {
            return false;
        }
        norm = norm.split(',').map(i => {
            return i.trim();
        });
        if (norm.length !== 3) {
            return false;
        }
        for (let [idx, num] of norm.entries()) {
            if (idx === 0) {
                if (parseInt(num, 10) > 360 || parseInt(num, 10) < 0) {
                    return false;
                }
            } else if (idx === 1 || idx === 2) {
                if (parseInt(num, 10) > 1 || parseInt(num, 10) < 0) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * A function to determine whether the given string input is a valid CSS hexadecimal, RGB or HSL color.
     *
     * @param  {String}  input The color input.
     * @return {Boolean}       [description]
     */
    function isColor(input) {
        return isHex(input) || isRGB(input) || isHSL(input);
    }

    /**
     * Checks if the input parameter has leading or trailing whitespaces, or too many spaces between words.
     *
     * @param  {String}  input The input string.
     * @return {Boolean}
     */
    function isTrimmed(input) {
        for (let i = 0; i < input.length; i++) {
            if (i === input.length - 1) {
                break;
            }
            let a = input.charCodeAt(i);
            let b = input.charCodeAt(i + 1);
            if ((a === 32) && (b === 32)) {
                return false;
            }
        }
        return true;
    }

    return {
        isEmailAddress,
        isPhoneNumber,
        withoutSymbols,
        isDate,
        isBeforeDate,
        isAfterDate,
        isBeforeToday,
        isAfterToday,
        isEmpty,
        contains,
        lacks,
        isComposedOf,
        isLength,
        isOfLength,
        countWords,
        lessWordsThan,
        moreWordsThan,
        isBetween,
        isAlphanumeric,
        isCreditCard,
        isHex,
        isRGB,
        isHSL,
        isColor,
        isTrimmed,
    };
});

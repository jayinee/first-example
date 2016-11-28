/* global SVGInjector, Velocity, chance */
/* eslint-disable new-cap */

(function (document) {
    /* ---- Utility Functions ----- */
    /**
     * A function that is used to determine that the DOM is ready for the JavaScript code to execute. "semi-equivalent" to jQuery's .ready().
     *
     */
    function documentReady(cb) {
        document.readyState === "interactive" || document.readyState === "complete" ? cb() : document.addEventListener("DOMContentLoaded", cb);
    }

    /**
     * A state management function. This functions also holds the state of the application in the state variable. The state of the application is then available via closure whenever the state.getState function is called.
     *
     * @param  {Function} reducer The function to be invoked when actions are dispatched.
     * @return {Object}
     */
    function createStore(reducer) {
        let state;
        let listeners = [];

        function getState() {
            return state;
        }

        function dispatch(action) {
            state = reducer(state, action);
            listeners.forEach(function (listener) {
                return listener();
            });
        }

        function subscribe(listener) {
            listeners.push(listener);
            return function () {
                listeners = listeners.filter(function (l) {
                    return l !== listener;
                });
            };
        }

        dispatch({});

        return {
            getState,
            dispatch,
            subscribe,
        };
    }

    /**
     * A function to prettify float numbers in JavaScript.
     *
     * @param  {String | Number} input Valid number input to be prettified.
     * @return {Number}       Prettified number output.
     */
    function fixFloat(input) {
        return parseFloat((Math.ceil(Number(input) * 20) / 20).toFixed(2));
    }

    /**
     * A function to search a matching object from an array via an id.
     * @param  {Number or String} id  The target id.
     * @param  {Array} arr The data array for the search.
     * @return {Object}     The matched object.
     */
    function findById(id, arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id == id) { //eslint-disable-line
                return arr[i];
            }
        }
    }

    /**
     * A function that creates an array of all the values of an object.
     *
     * @param  {Object} object The input object.
     * @return {Array}        An array with values from the input object.
     */
    function values(object) {
        const result = [];
        for (let prop in object) {
            if (Object.hasOwnProperty.call(object, prop)) {
                result.push(object[prop]);
            }
        }
        return result;
    }

    /* ---- Fake Data via Chance Library ----- */
    let products = [];
    for (let i = 0; i < 12; i++) {
        products.push({
            id: i,
            name: chance.word(),
            price: chance.integer({
                min: 19,
                max: 129,
            }),
            desc: chance.word(),
        });
    }

    const coupons = {
        '20OFF': 0.2,
        'BIGSALE': 0.5,
        'FLASHSLAE': 0.05,
    };

    /* ----  Begin  ----- */

    documentReady(function () {
        /**
         * Initializing state.
         */
        const initialState = {
            cart: 0,
            items: [],
            quantity: {},
            action: '',
            discount: {},
        };

        /**
         * The reducer function to handle actions and states.
         * When an action is dispatched via the dispatch function, the reducer will be invoked.
         * The reducer function will then update the state based on the actions.
         * Once the state is updated based on the dispatched action, a new state object is returned by the reducer function.
         * @param  {Object} state
         * @param  {Object} action The dispatched action from store.dispatch.
         * @return {Object}        The state of the application
         */
        function reducer(state = initialState, action) {
            switch (action.type) {
                case 'ADD': {
                    // Copying state to prevent state mutation.
                    const arr = state.items.slice();
                    // Only add items into the cart if it does not already exist.
                    if (!state.quantity[action.product.id]) {
                        arr.push(action.product);
                    }
                    return Object.assign({}, state, {
                        action: action.type,
                        cart: state.cart + 1,
                        items: arr,
                        quantity: Object.assign({}, state.quantity, {
                            [action.product.id]: state.quantity[action.product.id] ? state.quantity[action.product.id] + 1 : 1,
                        }),
                    });
                }
                case 'REMOVE': {
                    const arr = state.items.slice()
                    .filter(function (item) {
                        if (item.id != action.id) { //eslint-disable-line
                            return true;
                        }
                        return false;
                    });
                    const quantity = Object.assign({}, state.quantity);
                    delete quantity[action.id];
                    return Object.assign({}, state, {
                        action: action.type,
                        cart: state.cart - state.quantity[action.id],
                        items: arr,
                        quantity: quantity,
                    });
                }
                case 'DECREASE': {
                    const quantity = Object.assign({}, state.quantity);
                    quantity[action.id] = state.quantity[action.id] - 1;
                    return Object.assign({}, state, {
                        cart: state.cart - 1,
                        action: action.type,
                        quantity: quantity,
                    });
                }
                case 'INCREASE': {
                    const quantity = Object.assign({}, state.quantity);
                    quantity[action.id] = state.quantity[action.id] + 1;
                    return Object.assign({}, state, {
                        cart: state.cart + 1,
                        action: action.type,
                        quantity: quantity,
                    });
                }
                case 'DISCOUNT': {
                    return Object.assign({}, state, {
                        discount: {
                            [action.discount]: coupons[action.discount],
                        },
                    });
                }
                default:
                    return state;
            }
        }

        const store = createStore(reducer);
        const dispatch = store.dispatch;

        /**
         * Generating products (DOM Nodes) based on the fake data.
         */
        const productsContainer = document.querySelector('.products');
        products.forEach(function (product) {
            productsContainer.insertAdjacentHTML('beforeend', `<div id="${product.id}" class="product">
                <div class="product__info">
                    <span class="name">${product.name}</span>
                    <span class="price">$ ${product.price}</span>
                    <p class="desc">BY ${product.desc}</p>
                </div>
                <div class="add">
                    <i class="ion-ios-cart"></i>
                    <span class="add__text">Add to cart</span>
                </div>
            </div>`);
        });

        /**
         * Inject SVG images into the DOM.
         */
        var injectElements = document.querySelectorAll('img.svg');
        SVGInjector(injectElements);

        /**
         * List of placeholder colors.
         *
         */
        const placeholderColors = ['#ffd213', '#896f00', '#ffda3a', '#b08e00', '#ffe161', '#ffe575', '#ffec9c', '#d7ae00'];

        /**
         * Generating random product "background".
         */
        const placeholders = document.querySelectorAll('.product, .img');
        [].forEach.call(placeholders, function (el) {
            const random = Math.floor(Math.random() * (7 - 0 + 1)) + 0;
            const color = placeholderColors[random];
            el.style.backgroundColor = color;
        });

        /**
         * Attching event listeners to open and close the cart.
         */
        document.querySelector('#cart').addEventListener('click', function (e) {
            e.preventDefault();
            document.body.style.overflowY = 'hidden';
            document.querySelector('.shopping__container').style.display = 'block';
            Velocity(document.querySelector('.shopping__cart--container'), 'fadeIn');
        });

        document.querySelector('.shopping__container .close').addEventListener('click', function () {
            document.body.style.overflowY = 'scroll';
            document.querySelector('.shopping__container').style.display = 'none';
        });

        /**
         * Attaching event listeners to the add to cart button.
         */
        [].forEach.call(document.querySelectorAll('.product .add'), function (el) {
            el.addEventListener('click', function () {
                dispatch({ type: 'ADD', product: products[el.parentNode.getAttribute('id')] });
            });
        });

        /**
         * Attaching event listeners to apply voucher button.
         */
        document.querySelector('.voucher__container .button').addEventListener('click', function () {
            const discountCode = document.querySelector('.voucher__container input').value;
            if (coupons[discountCode]) {
                dispatch({ type: 'DISCOUNT', discount: discountCode });
            } else {
                Velocity(document.querySelector('.voucher__container input'), 'callout.shake');
            }
        });

        /**
        * A function that is invoked whenever the state changes. So when the state changes, the display output in the browser also changes.
        *
        */
        function render() {
            console.log(store.getState());
            /**
             * Checking state so that the DOM does not have to rerender that often.
             * Updating UI based on cart items.
             */
            if (store.getState().cart > 0) {
                document.querySelector('.grandtotal__container').style.display = 'flex';
                document.querySelector('.voucher__container').style.display = 'block';
                document.querySelector('.heading.coupon').style.display = 'block';
                document.querySelector('.heading.summary').style.display = 'block';
                document.querySelector('.noproduct').style.display = 'none';
            } else {
                document.querySelector('.grandtotal__container').style.display = 'none';
                document.querySelector('.voucher__container').style.display = 'none';
                document.querySelector('.heading.coupon').style.display = 'none';
                document.querySelector('.heading.summary').style.display = 'none';
                Velocity(document.querySelector('.noproduct'), 'transition.slideDownIn');
            }
            /**
             * State check to prevent uncessary re-render of DOM elements.
             *
             */
            if (store.getState().action === 'ADD') {
                Velocity(document.querySelector('#cart .count'), 'callout.bounce');
                /**
                 * Updating the shopping cart as more items are added to it.
                 *
                 */
                let itemHTMLString = '<div class="noproduct" style="display: none;">Your Shopping Cart is Empty</div>';
                store.getState().items.forEach(function (item) {
                    itemHTMLString += `<div data-id="${item.id}" class="checkout__item">
                        <div class="img"></div>
                        <div class="name">${item.name}</div>
                        <div class="quantity">
                            <div class="increase"><i class="ion-ios-arrow-up"></i></div>
                            <input value="${store.getState().quantity[item.id]}" type="text">
                            <div class="decrease"><i class="ion-ios-arrow-down"></i></div>
                        </div>
                        <div class="price">$ ${store.getState().quantity[item.id] * item.price}</div>
                        <div class="remove"><i class="ion-trash-b"></i></div>
                    </div>`;
                });
                document.querySelector('.products__container').innerHTML = itemHTMLString;

                /**
                 * Attaching event listener once the DOM nodes are created. This
                 * prevents the need complex event delegation.
                 */
                [].forEach.call(document.querySelectorAll('.ion-trash-b'), function (el) {
                    el.addEventListener('click', function () {
                        const parent = el.parentNode.parentNode;
                        Velocity(parent, 'transition.slideDownOut');
                        dispatch({ type: 'REMOVE', id: parent.getAttribute('data-id') });
                    });
                });

                /**
                 * Attching event listeners to the increase and decrease buttons.
                 *
                 */
                [].forEach.call(document.querySelectorAll('.quantity .increase'), function (el) {
                    el.addEventListener('click', function () {
                        const parent = el.parentNode.parentNode;
                        const id = parent.getAttribute('data-id');
                        dispatch({ type: 'INCREASE', id });
                        // Updating product quantity count.
                        parent.querySelector('input').value = store.getState().quantity[id];
                        const item = findById(id, store.getState().items);
                        parent.querySelector('.price').innerHTML = `$
                         ${store.getState().quantity[id] * item.price}`;
                    });
                });

                [].forEach.call(document.querySelectorAll('.quantity .decrease'), function (el) {
                    el.addEventListener('click', function () {
                        const parent = el.parentNode.parentNode;
                        const id = parent.getAttribute('data-id');
                        if (store.getState().quantity[id] === 1) {
                            Velocity(parent, 'transition.slideDownOut');
                            dispatch({ type: 'REMOVE', id });
                        } else {
                            dispatch({ type: 'DECREASE', id });
                            // Updating product quantity count.
                            parent.querySelector('input').value = store.getState().quantity[id];
                            const item = findById(id, store.getState().items);
                            parent.querySelector('.price').innerHTML = `$
                             ${store.getState().quantity[id] * item.price}`;
                        }
                    });
                });
            }

            /**
             * Calculating prices.
             *
             */
            let subTotal = 0;
            store.getState().items.forEach(function (item) {
                subTotal += item.price * (store.getState().quantity[item.id]);
            });
            const discounts = values(store.getState().discount);
            let discount = 0;
            if (discounts.length === 1) {
                discount = discounts[0];
                document.querySelector('.discount .price').innerHTML = ` &minus; $ ${fixFloat(subTotal * discount)}`;
                document.querySelector('.discount').style.display = 'flex';
            }
            let taxes = fixFloat((subTotal * 0.05));
            const grandTotal = fixFloat(subTotal + taxes + 15 - (subTotal * discount));
            document.querySelector('.subtotal .price').innerHTML = `$ ${subTotal}`;
            document.querySelector('.tax .price').innerHTML = `$ ${taxes}`;
            document.querySelector('.grandtotal .price').innerHTML = `$ ${grandTotal}`;
            document.querySelector('.shipping .price').innerHTML = '$ 15';
            document.querySelector('#cart .count').innerHTML = store.getState().cart;
        }

        /**
         * Subsribing to changes from the state. If that state changes, the provided function (render) will be invoked.
         *
         */
        store.subscribe(render);
    });
})(document);

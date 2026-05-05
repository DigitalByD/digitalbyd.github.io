(function() {
    const CART_KEY = "digitalbyd-cart";
    const ORDER_KEY = "digitalbyd-last-order";

    function loadCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCartBadges();
    }

    function formatPrice(value) {
        return new Intl.NumberFormat("ro-RO", {
            style: "currency",
            currency: "RON",
            maximumFractionDigits: 0
        }).format(value);
    }

    function getCartCount() {
        return loadCart().reduce(function(total, item) {
            return total + item.quantity;
        }, 0);
    }

    function getCartTotal() {
        return loadCart().reduce(function(total, item) {
            return total + (item.price * item.quantity);
        }, 0);
    }

    function showToast(message) {
        let toast = document.getElementById("cartToast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "cartToast";
            toast.className = "cart-toast";
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add("show");

        window.clearTimeout(showToast.timeoutId);
        showToast.timeoutId = window.setTimeout(function() {
            toast.classList.remove("show");
        }, 2200);
    }

    function renderCartBadges() {
        const count = getCartCount();

        document.querySelectorAll("[data-cart-count]").forEach(function(node) {
            node.textContent = count;
            node.classList.toggle("is-empty", count === 0);
        });
    }

    function addItem(item) {
        const cart = loadCart();
        const key = item.key || item.id;
        const existing = cart.find(function(entry) {
            return entry.key === key;
        });

        if (existing) {
            existing.quantity += item.quantity || 1;
        } else {
            cart.push({
                id: item.id,
                key: key,
                name: item.name,
                category: item.category || "",
                price: Number(item.price) || 0,
                quantity: item.quantity || 1,
                image: item.image || "",
                note: item.note || ""
            });
        }

        saveCart(cart);
        showToast(item.name + " a fost adaugat in cos");
    }

    function addSimpleProduct(button) {
        const card = button.closest("[data-product-id]");

        if (!card) {
            return;
        }

        addItem({
            id: card.dataset.productId,
            key: card.dataset.productId,
            name: card.dataset.productName,
            category: card.dataset.productCategory,
            price: Number(card.dataset.productPrice),
            image: card.dataset.productImage || "",
            note: card.dataset.productNote || ""
        });
    }

    function addConfiguredProduct(button) {
        const chooser = button.closest(".package-chooser");
        const select = chooser ? chooser.querySelector(".package-select") : null;

        if (!chooser || !select) {
            return;
        }

        const option = select.options[select.selectedIndex];
        const packageName = option.dataset.package || option.textContent;

        addItem({
            id: chooser.dataset.id,
            key: chooser.dataset.id + ":" + packageName,
            name: chooser.dataset.model + " - " + packageName,
            category: chooser.dataset.category,
            price: Number(option.value),
            image: chooser.dataset.image || "",
            note: option.dataset.note || ""
        });
    }

    function removeItem(key) {
        const cart = loadCart().filter(function(item) {
            return item.key !== key;
        });

        saveCart(cart);
        renderCartPage();
    }

    function changeQuantity(key, delta) {
        const cart = loadCart();
        const item = cart.find(function(entry) {
            return entry.key === key;
        });

        if (!item) {
            return;
        }

        item.quantity += delta;

        if (item.quantity <= 0) {
            removeItem(key);
            return;
        }

        saveCart(cart);
        renderCartPage();
    }

    function clearCart() {
        saveCart([]);
        renderCartPage();
    }

    function buildOrderSummary(cart) {
        return cart.map(function(item) {
            const note = item.note ? " | " + item.note : "";
            return item.quantity + " x " + item.name + " - " + formatPrice(item.price) + note;
        }).join("\n");
    }

    function renderCartPage() {
        const itemsHost = document.querySelector("[data-cart-items]");
        const emptyHost = document.querySelector("[data-cart-empty]");
        const totalHost = document.querySelector("[data-cart-total]");
        const subtotalHost = document.querySelector("[data-cart-subtotal]");
        const countHost = document.querySelector("[data-cart-items-count]");
        const submitButton = document.querySelector("[data-cart-submit]");
        const clearButton = document.querySelector("[data-clear-cart]");
        const cart = loadCart();

        if (!itemsHost) {
            return;
        }

        if (clearButton) {
            clearButton.disabled = cart.length === 0;
        }

        if (!cart.length) {
            itemsHost.innerHTML = "";
            if (emptyHost) {
                emptyHost.style.display = "block";
            }
            if (totalHost) {
                totalHost.textContent = formatPrice(0);
            }
            if (subtotalHost) {
                subtotalHost.textContent = formatPrice(0);
            }
            if (countHost) {
                countHost.textContent = "0 produse";
            }
            if (submitButton) {
                submitButton.disabled = true;
            }
            return;
        }

        if (emptyHost) {
            emptyHost.style.display = "none";
        }

        itemsHost.innerHTML = cart.map(function(item) {
            return [
                '<article class="cart-item">',
                item.image ? '<img class="cart-item-image" src="' + item.image + '" alt="' + item.name + '">' : "",
                '<div class="cart-item-body">',
                '<div class="cart-item-head">',
                '<div>',
                '<span class="cart-item-category">' + item.category + "</span>",
                "<h3>" + item.name + "</h3>",
                item.note ? '<p class="cart-item-note">' + item.note + "</p>" : "",
                "</div>",
                '<strong class="cart-item-price">' + formatPrice(item.price) + "</strong>",
                "</div>",
                '<div class="cart-item-actions">',
                '<div class="cart-qty">',
                '<button type="button" onclick="DigitalByDStore.changeQuantity(\'' + item.key + '\', -1)">-</button>',
                "<span>" + item.quantity + "</span>",
                '<button type="button" onclick="DigitalByDStore.changeQuantity(\'' + item.key + '\', 1)">+</button>',
                "</div>",
                '<button class="text-button" type="button" onclick="DigitalByDStore.removeItem(\'' + item.key + '\')">Sterge</button>',
                "</div>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");

        if (totalHost) {
            totalHost.textContent = formatPrice(getCartTotal());
        }
        if (subtotalHost) {
            subtotalHost.textContent = formatPrice(getCartTotal());
        }
        if (countHost) {
            countHost.textContent = getCartCount() + " produse";
        }
        if (submitButton) {
            submitButton.disabled = false;
        }
    }

    function setCheckoutTargets(form) {
        const nextField = form.querySelector('input[name="_next"]');
        const urlField = form.querySelector('input[name="_url"]');

        if (urlField) {
            if (window.location.protocol === "file:") {
                urlField.value = "cosul-meu.html";
            } else {
                urlField.value = window.location.href;
            }
        }

        if (!nextField) {
            return;
        }

        if (window.location.protocol === "file:") {
            nextField.value = "plata.html";
        } else {
            nextField.value = new URL("plata.html", window.location.href).href;
        }
    }

    function bindCheckoutForm() {
        const form = document.querySelector("[data-checkout-form]");

        if (!form) {
            return;
        }

        setCheckoutTargets(form);

        form.addEventListener("submit", function(event) {
            const cart = loadCart();

            if (!cart.length) {
                event.preventDefault();
                showToast("Cosul este gol");
                return;
            }

            const summary = buildOrderSummary(cart);
            const total = getCartTotal();
            const nameField = form.querySelector('input[name="name"]');
            const emailField = form.querySelector('input[name="email"]');
            const phoneField = form.querySelector('input[name="phone"]');
            const eventTypeField = form.querySelector('select[name="event-type"]');
            const eventDateField = form.querySelector('input[name="event-date"]');
            const notesField = form.querySelector('textarea[name="message"]');

            form.querySelector('textarea[name="order-summary"]').value = summary;
            form.querySelector('input[name="order-total"]').value = formatPrice(total);
            form.querySelector('input[name="order-count"]').value = String(getCartCount());

            localStorage.setItem(ORDER_KEY, JSON.stringify({
                items: cart,
                total: total,
                customer: {
                    name: nameField ? nameField.value : "",
                    email: emailField ? emailField.value : "",
                    phone: phoneField ? phoneField.value : "",
                    eventType: eventTypeField ? eventTypeField.value : "",
                    eventDate: eventDateField ? eventDateField.value : "",
                    notes: notesField ? notesField.value : ""
                }
            }));
        });
    }

    function renderPaymentPage() {
        const host = document.querySelector("[data-payment-summary]");
        const totalHost = document.querySelector("[data-payment-total]");
        const paymentCopy = document.querySelector("[data-payment-copy]");
        const paymentStatus = document.querySelector("[data-payment-status]");

        if (!host) {
            return;
        }

        const raw = localStorage.getItem(ORDER_KEY);

        if (!raw) {
            host.innerHTML = '<p class="payment-empty">Nu exista inca o comanda trimisa din cos.</p>';
            if (totalHost) {
                totalHost.textContent = formatPrice(0);
            }
            if (paymentCopy) {
                paymentCopy.textContent = "Dupa trimiterea comenzii, aici apare mesajul de confirmare si urmatorii pasi.";
            }
            if (paymentStatus) {
                paymentStatus.textContent = "Trimite mai intai comanda din cos pentru a putea continua.";
            }
            return;
        }

        const order = JSON.parse(raw);

        if (totalHost) {
            totalHost.textContent = formatPrice(order.total || 0);
        }

        host.innerHTML = (order.items || []).map(function(item) {
            return [
                '<div class="payment-line">',
                "<strong>" + item.name + "</strong>",
                "<span>" + item.quantity + " x " + formatPrice(item.price) + "</span>",
                "</div>"
            ].join("");
        }).join("");

        const customerName = document.querySelector("[data-payment-name]");
        const customerEmail = document.querySelector("[data-payment-email]");
        const customerPhone = document.querySelector("[data-payment-phone]");
        const customerEvent = document.querySelector("[data-payment-event]");

        if (customerName) {
            customerName.textContent = order.customer && order.customer.name ? order.customer.name : "-";
        }
        if (customerEmail) {
            customerEmail.textContent = order.customer && order.customer.email ? order.customer.email : "-";
        }
        if (customerPhone) {
            customerPhone.textContent = order.customer && order.customer.phone ? order.customer.phone : "-";
        }
        if (customerEvent) {
            customerEvent.textContent = order.customer && order.customer.eventDate ? order.customer.eventType + " | " + order.customer.eventDate : (order.customer && order.customer.eventType ? order.customer.eventType : "-");
        }

        if (paymentCopy) {
            paymentCopy.textContent = "Iti multumim pentru comanda. In urmatoarele 1-2 zile vei fi contactat pentru plata si pentru stabilirea tuturor detaliilor finale.";
        }
        if (paymentStatus) {
            paymentStatus.textContent = "Vei primi telefonic sau pe email toate informatiile despre plata si despre pasii urmatori.";
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        renderCartBadges();
        renderCartPage();
        bindCheckoutForm();
        renderPaymentPage();
    });

    window.DigitalByDStore = {
        addItem: addItem,
        addSimpleProduct: addSimpleProduct,
        addConfiguredProduct: addConfiguredProduct,
        changeQuantity: changeQuantity,
        removeItem: removeItem,
        clearCart: clearCart,
        formatPrice: formatPrice,
        getCartCount: getCartCount,
        getCartTotal: getCartTotal
    };
})();

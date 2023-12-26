const shopBtn = document.querySelector('.shop-icon');
const closeBtn = document.querySelector('.close-cart-btn');
// const shopBtn = document.querySelector('.banner-btn');
const clearBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverLay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDom = document.querySelector('.products-center');
const bagBtn = document.querySelector('.bag-btn');
const removeBtn = document.querySelector('.remove-item');

let cart = [];
let btnsDom = [];

// getting the products
class Products {
  async getProducts() {
    try {
      const res = await fetch('products.json');
      const data = await res.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return {
          title,
          price,
          id,
          image,
        };
      });

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//display products
class Ui {
  displayProducts(products) {
    let html = '';
    products.forEach((product) => {
      html += ` <article class="product">
      <div class="img-container">
        <img
          src=${product.image}
          alt="product"
          class="product-img"
        />
        <button class="bag-btn" data-id=${product.id}>
          <span><svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="bag-shop-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg></span>
          <span>add to cart</span>
        </button>
      </div>
      <h3>${product.title}</h3>
      <h4>$${product.price}</h4>
    </article>`;
    });
    productDom.innerHTML = html;
  }
  getBagButtons() {
    const btns = [...document.querySelectorAll('.bag-btn')];

    btnsDom = btns;
    btns.forEach((btn) => {
      let id = btn.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        btn.innerText = 'In Cart';
        btn.disabled = true;
      }
      btn.addEventListener('click', (e) => {
        const realTarget = e.target.closest('.bag-btn');
        realTarget.innerText = 'In Cart';
        realTarget.disabled = true;
        //get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        //add product to the cart
        cart = [...cart, cartItem];
        //save cart in local storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `<img src=${item.image} alt="product" />
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="chevron chevron-up" data-id=${item.id}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.5 15.75l7.5-7.5 7.5 7.5"
        />
      </svg>
      <p class="item-amount">${item.amount}</p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="chevron chevron-down" data-id=${item.id}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
    </div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverLay.classList.add('transparentBcg');
    cartDom.classList.add('showCart');
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    shopBtn.addEventListener('click', this.showCart);
    closeBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverLay.classList.remove('transparentBcg');
    cartDom.classList.remove('showCart');
  }
  cartLogic() {
    // this one was that block!
    //clear cart btn
    clearBtn.addEventListener('click', () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-item')) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains('chevron-up')) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains('chevron-down')) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="bag-shop-icon"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
    />
  </svg>
  <span>add to bag</span>`;
  }
  getSingleButton(id) {
    return btnsDom.find((btn) => btn.dataset.id === id);
  }
}
// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }
  /////////
  /////////
  /////////
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new Ui();
  const products = new Products();
  // setup app
  ui.setupAPP();
  products.getProducts().then((products) => {
    ui.displayProducts(products);
    Storage.saveProducts(products);
    ui.getBagButtons();
    ui.cartLogic();
  });
  // .then(() => {
  //   ui.getBagButtons();
  //   ui.cartLogic();
  // });
});

import React, { useState, createContext, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Container, Menu, Icon } from "semantic-ui-react";
import "./App.css";
import BookList from "./components/BookList";
import CartSummary from "./components/CartSummary";
import CartDetails from "./components/CartDetails";
import Axios from "axios";


export const CartContext = createContext();
const CART_KEY = "react-shop";

function App() {
  const [cart, setCart] = useState({});
  const [nbArticles, setNbArticles] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartDiscount, setCartDiscount] = useState(0);

  
 


  //!\ order matters: first useEffect() retrieves from localStorage, second useEffect persists in localStorage
  useEffect(() => {
    const cartFromStorage = localStorage.getItem(CART_KEY);
    if (cartFromStorage !== null) {
      setCart(JSON.parse(cartFromStorage));
    }
  }, []);
  
  useEffect(() => {
    // only strings in localStorage
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            document.title = `La bibliothèque d'Henri Potier(${nbArticles})`;
   
  }
  , [cart, nbArticles]);

  function addToCart(item) {
    
    if (!cart[item.isbn]) {
      cart[item.isbn] = item;
      cart[item.isbn].quantity = 1;
    } else {
      cart[item.isbn].quantity += 1;
    }
    setCart({ ...cart });
    console.log("cart", cart);
  }

  function removeFromCart(item) {
    if (cart[item.isbn].quantity !== 1) {
      cart[item.isbn].quantity = cart[item.isbn].quantity - 1;
    } else {
      delete cart[item.isbn];
    }
    setCart({ ...cart });
    console.log("cart", cart);
  }

  function emptyCart() {
    const response = window.confirm(
      "Etes-vous vous sûr de vouloir vider le panier ? "
    );
    if (response) {
      setCart({});
    }
  }

  function countCartArticles() {
    let total = 0;
    Object.keys(cart).map((key) => (total += cart[key].quantity));
    setNbArticles(total);
    
    return total;
  }
   

  function counttotalPrice()  { 
    let somme = 0;
    Object.keys(cart).map(
      (key) => (somme += cart[key].quantity * cart[key].price)
    );
    setTotalPrice(somme);
    return somme;
    
  }
 

const findBestOffers = async () => {
    let id = Object.keys(cart).map((key) => cart[key].isbn);
  

    if (id.length > 0) {
      const result = await Axios.get(
        "http://henri-potier.xebia.fr/books/" +
          id.join(",") +
          "/commercialOffers"
      );

    BestOffers(result.data.offers);
       }
  };
     
  const BestOffers = offers => {
      const remise = [];

      offers.forEach((offer) => {
        if (offer.type === "percentage") {
          remise.push(
            (((counttotalPrice()) * offer.value) / 100)
          );
        } else if (offer.type === "minus") {
          remise.push((counttotalPrice()) - ((counttotalPrice()) - offer.value));
        } else if (offer.type === "slice") {
          const slices = Math.floor((counttotalPrice()) / offer.sliceValue);
          remise.push (slices * offer.value);
        }
      });
 
      setCartDiscount(Math.max(...remise));
      return Math.max(...remise);
 
    };

   
findBestOffers();


  const contextValue = {
    cart,
    addToCart,
    countCartArticles,
    removeFromCart,
    emptyCart,
    counttotalPrice,
    totalPrice,
    setTotalPrice,
    setCartDiscount,
    findBestOffers,
    cartDiscount,
   
  };

  return (
    <>
      <Router>
        <CartContext.Provider value={contextValue}>
          <Container>
            <br />
            <Menu stackable>
              <Menu.Item>
                <Link to="/">La bibliothèque d'Henri Potier</Link>
              </Menu.Item>
              <Menu.Item>
                <Link to="/cart">
                  <Icon name="cart" size="small" /> <CartSummary />
                </Link>
              </Menu.Item>
            </Menu>
            <br />
          </Container>
          <Switch>
            <Route path="/cart" component={CartDetails} />
            <Route path="/" component={BookList} />
          </Switch>
        </CartContext.Provider>
      </Router>
    </>
  );
}

export default App;

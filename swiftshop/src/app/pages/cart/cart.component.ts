import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  cartStatus!: string;
  carts: Cart[] = []

  ngOnInit() {
    this.loadCart();
  }

  constructor(private cartService: CartService) { }

  loadCart() {
    this.cartService.getMyCart().subscribe(
      (response: any) => {
        console.log(response);
        const jsonResponse = JSON.parse(response); // Parse the JSON string
        this.carts = jsonResponse as Cart[];      // Map the parsed data into the cart array
        this.carts.forEach(item => {item.totalPrice = item.Price * item.Quantity});
      },
      (error) => {
        console.error('Error fetching cart:', error);
        this.cartStatus = error;
      }
    )
  }

  deleteItem(cartID: number) {
    this.cartService.deleteItem(cartID).subscribe(
      (response) => {
        console.log(response);
        this.carts=this.carts.filter(item => item.CartID !== cartID)
        this.cartStatus = response.message
      },
      (error) => {
        console.error('Error deleteing item:', error);
        this.cartStatus = error
      }
    )
  }
  
  changeQuantity(item: Cart) {
    this.cartService.changeQuantity(item.ItemID, item.Quantity).subscribe(
      (reponse) => {
        console.log(reponse);
        item.totalPrice = item.Price * item.Quantity;
        this.cartStatus = reponse.message
      },
      (error) => {
        console.error('Error changing quantity:', error);
        this.cartStatus = error;
      }
    )
  }

  placeOrder() {
    this.cartService.placeOrders().subscribe(
      (reponse: any) => {
        console.log(reponse);
        this.cartStatus = reponse.message
        this.carts = []
      },
      (error: any) => {
        console.error('Error placing order:', error);
        this.cartStatus = error;
      }
    )
  }
}

export interface Cart {
  CartID: number,
  ItemID: number,
  ItemName: string,
  ItemDesc: string,
  Quantity: number,
  Price: number,
  totalPrice: number,
  selected: boolean
}
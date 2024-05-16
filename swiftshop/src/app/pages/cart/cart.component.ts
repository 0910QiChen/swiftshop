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
        this.carts = jsonResponse as Cart[]; // Map the parsed data into the logs array
        this.carts.forEach(item => {item.totalPrice = item.Price * item.Quantity});
      },
      (error) => {
        console.error('Error fetching cart:', error);
        this.cartStatus = error;
      }
    )
  }

  deleteItem(itemID: number) {
    this.cartService.deleteItem(itemID).subscribe(
      (response) => {
        console.log(response);
        this.carts=this.carts.filter(item => item.ItemID !== itemID)
      },
      (error) => {
        console.error('Error deleteing item', error);
      }
    )
  }
  
  changeQuantity(item: Cart) {
    this.cartService.changeQuantity(item.ItemID, item.Quantity).subscribe(
      (reponse) => {
        console.log(reponse);
        item.totalPrice = item.Price * item.Quantity;
      },
      (error) => {
        console.error('Error changing quantity', error);
      }
    )
  }
}

export interface Cart {
  ItemID: number,
  ItemName: string,
  ItemDesc: string,
  Quantity: number,
  Price: number
  totalPrice: number
}
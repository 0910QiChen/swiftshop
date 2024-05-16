import { Component, OnInit } from '@angular/core';
import { DashService } from '../../services/dash.service'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  dashStatus!: string;
  ItemID!: number;
  quantities: {[key: number]: number} = {};
  items: Item[] = [];

  ngOnInit(){
    this.loadItems()
  }

  constructor(private dashService: DashService, private router: Router) { }

  loadItems() {
    this.dashService.getItems().subscribe(
      (response: any) => {
        console.log(response);
        const jsonResponse = JSON.parse(response); // Parse the JSON string
        this.items = jsonResponse as Item[]; // Map the parsed data into the logs array
      },
      (error: any) => {
        console.error('Error fetching items:', error);
        this.dashStatus = error;
      }
    )
  }

  addToCart(item: Item) {
    const quantity = this.quantities[item.ItemID] || 1;
    this.dashService.addToCart(item.ItemID, quantity).subscribe(
      (response) => {
        console.log(response)
        this.dashStatus = response.message;
      },
      (error) => {
        console.error('Error adding to cart:', error);
        this.dashStatus = error;
      }
    )
  }

  onLogin(){
    this.router.navigate(['/login']); // Redirect to the login page
  }
}

export interface Item {
  ItemID: number,
  ItemName: string,
  ItemDesc: string,
  Price: number,
}

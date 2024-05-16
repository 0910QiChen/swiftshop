import { CommonModule, Time } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {

  logStatus!: string;
  logs: Log[] = [];
  trackingNumbers: TrackingNumbers[] = [];
  tracking_number!: string;

  ngOnInit(): void {
    this.loadOrders();
  }

  constructor(private orderService: OrderService) { }

  loadOrders() {
    this.orderService.loadTrackingNumber().subscribe(
      (response: string) => {
        const jsonResponse = JSON.parse(response); // Parse the JSON string
        this.trackingNumbers = jsonResponse as TrackingNumbers[]; // Map the parsed data into the accounts array
        const uniqueTrackingNumbers = new Set<string>(); // Set to store unique tracking numbers

        // Filter out duplicate tracking numbers
        const filteredTrackingNumbers = this.trackingNumbers.filter((trackingNumber) => {
        if (!uniqueTrackingNumbers.has(trackingNumber.TrackingNumber)) {
          uniqueTrackingNumbers.add(trackingNumber.TrackingNumber);
          return true; // Include this tracking number in the result array
        }
        return false; // Skip this tracking number
      });

      this.trackingNumbers = filteredTrackingNumbers; // Assign unique tracking numbers to the array
      },
      (error) => {
        console.error('Error fetching tracking numbers:', error);
        this.logStatus = error;
      }
    );
  }

  loadLogs(trackingNumber: string) {
    this.orderService.showLog(trackingNumber).subscribe(
      (response: any) => {
        console.log(response);
        const jsonResponse = JSON.parse(response); // Parse the JSON string
        this.logs = jsonResponse as Log[]; // Map the parsed data into the logs array
      },
      (error) => {
        console.error('Error fetching orders:', error);
        this.logStatus = error;
      }
    )
  }
}

export interface Log {
  ItemID: number,
  ItemName: string,
  Quantity: number,
  Price: number,
  OrderDate: Time,
  OrderStatus: string
}

export interface TrackingNumbers {
  TrackingNumber: string
}
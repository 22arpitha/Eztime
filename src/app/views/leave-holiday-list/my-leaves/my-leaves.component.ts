import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { error } from 'console';

@Component({
  selector: 'app-my-leaves',
  templateUrl: './my-leaves.component.html',
  styleUrls: ['./my-leaves.component.scss']
})
export class MyLeavesComponent implements OnInit {
  BreadCrumbsTitle:any='Overview';
  leaveBalence: any = [];
  leaveDetails: any = [];
  holidayList: Object;
  orgId: any;
  leaveData= [];
  user_id: string;
  constructor(
    private api:ApiserviceService,
    private location:Location,
    private common_service:CommonServiceService) { }
  goBack(event){
  event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id')
    this.getLeaveOverview()
  }
  getLeaveOverview(){
    this.api.getData(`${environment.live_url}/${environment.employee_leaves}/?employee-id=${this.user_id}`).subscribe((res:any)=>{
      if(res){
        this.leaveData = res
      }
    },((error:any)=>{
      this.api.showError(error?.error?.message)
    }))
  }
 
}

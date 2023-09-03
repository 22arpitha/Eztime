import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { TimesheetService } from 'src/app/service/timesheet.service';

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.scss']
})
export class DeadlineApprovedComponent implements OnInit {
  @Output() buttonClick = new EventEmitter<string>();
  slno:any;
  date:any;
  people:any;
  timesheet:any;
  time:any;
  savedon:any;
  approvedon:any;
  approvedby:any;
  status:any;
  action:any;
  term:any;
  approvedAll:any = [];
  userId: any = 1;
  page:any = 1;
  approveCount = 0;
  tableSize = 10;
  tableSizes = [10, 25, 50, 100];
  count = 0;
  accessConfig: any = [];
  user_id: any;
  noOfPages: any;
  
  @Input() set data(value) {
    this.approvedAll = value;
    // this.count = value['count']
  }

  get data(): string {
    return this.approvedAll;
  }
  @Input() set totalCount(value){
    let add:string = '0'
    let tableCount:string = value
    this.count = Number(tableCount+add);

  }
  constructor(private _timesheet:TimesheetService,
    private modalService:NgbModal,
    private api:ApiserviceService,
    private common_service:CommonServiceService) {
      
   }
   ngOnInit(){
    this.user_id = sessionStorage.getItem('user_id')
    this.getUserControls()
 }
 getUserControls(){
  this.api.getUserRoleById(`user_id=${this.user_id}&page_number=1&data_per_page=10`).subscribe((res:any)=>{
    if(res.status_code !== '401'){
      this.common_service.permission.next(res['data'][0]['permissions'])
     // //console.log(this.common_service.permission,"PERMISSION")
    }
    else{
      this.api.showError("ERROR !")
    }
  //  //console.log(res,'resp from yet');
    
  }

  )

  this.common_service.permission.subscribe(res=>{
    const accessArr = res
    accessArr.forEach((element,i) => {
      if(element['MONTH_APPROVAL_TIMESHEET']){
        this.accessConfig = element['MONTH_APPROVAL_TIMESHEET']
      } 
    });
  })

  }

 
  onTableDataChange(event:any){
    this.page = event;
    this.buttonClick.emit(event)
  }  
  onTableSizeChange(event:any): void {
    this.tableSize = Number(event.target.value);
    this.count = 0
    const calculatedPageNo = this.count / this.tableSize
    if(calculatedPageNo < this.page){
      this.page = 1
    }
    this.buttonClick.emit(this.page)
  } 
}

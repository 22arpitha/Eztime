import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {   FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-declined',
  templateUrl: './declined.component.html',
  styleUrls: ['./declined.component.scss']
})
export class DeclinedComponent implements OnInit {
  @Output() buttonClick:any = new EventEmitter<string>();
  list:any=[];
  slno:any;
  fromDate:any;
  toDate:any;
  appliedDays:any;
  allotedLeaves:any;
  usedLeaves:any;
  AppliedDate:any;
  rejectedBy:any;
  rejectedDate:any;
  status:any;
  action:any;
  //delData: any;
  page:any = 1;
  count = 0;
  tableSize = 10;
  tableSizes = [10, 25, 50, 100];
  AllListData: any;
  params: any;
  pagination: any;
  term;
  entryPoint: any;
  user_id: any;
  accessConfig: any;
   
  @Input() set data(value) {
    this.list = value;
    // this.count = value['count']
  }

  get data(): string {
    return this.list;
  }
  @Input() set totalCount(value){
    let add:string = '0'
    let tableCount:string = value
    this.count = Number(tableCount+add);
    ////console.log(this.count,"COUNT---") 
 }
 
  constructor(private builder:FormBuilder, private api:ApiserviceService,private modalService:NgbModal,
    public common_service:CommonServiceService) { }

  ngOnInit(): void {
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
       // //console.log(res,'resp from yet');
        
      }
      )
      this.common_service.permission.subscribe(res=>{
        const accessArr = res
        if(accessArr.length > 0){
          accessArr.forEach((element,i) => {
            if(element['APPLIED/APPROVIED_LEAVES']){
              this.accessConfig = element['APPLIED/APPROVIED_LEAVES']
            }
            
          });  
        }
     
      //  console.log(this.accessConfig,"this.accessConfig")
      })
    }
    

  delete(item:any){
    let content ={
      module: "LEAVE/HOLIDAY_LIST",
      menu: "APPLIED/APPROVIED_LEAVES",
      method: "DELETE",
      user_id: this.user_id,
   }
    this.api.deletePeopleLeaves(item.id,content).subscribe((data:any)=>{
   //   //console.log(data,"DELETE")
      this.api.showWarning('Declined leave deleted successfully!')
      let tableData ={
        page:this.page,
        tableSize:this.tableSize
       }
      this.buttonClick.emit(tableData);
    },((error:any)=>{
      this.api.showError(error.error.error.message);
      
    }))

  }
  open(content) {
    if(content){
      const modelRef =   this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered:true
      });
     
      modelRef.componentInstance.status.subscribe(resp => {
        if(resp == "ok"){
         this.delete(content);
         modelRef.close();
        }
        else{
          modelRef.close();
        }
    })
	
	}
  

  }
  onTableDataChange(event:any){
    this.page = event;
    let tableData ={
      page:this.page,
      tableSize:this.tableSize
     }
    this.buttonClick.emit(tableData);
  }  
  onTableSizeChange(event:any): void {
    this.tableSize = Number(event.target.value);
    this.count = 0
    // Calculate new page number
    const calculatedPageNo = this.count / this.tableSize
    
    if(calculatedPageNo < this.page){
      this.page = 1
    }
    let tableData ={
      page:this.page,
      tableSize:this.tableSize
     }
    this.buttonClick.emit(tableData);
  }
  openDialogue(content,status){
    if(content){
      const selectedStatus = status === 'APPROVED' ? 'approve' : 'decline'
      const confirmText  = status === 'APPROVED' ? 'Approve' :'Decline'
      const modelRef =   this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm'
  ,
        backdrop: true,
        centered:true
      });
      modelRef.componentInstance.title = `Are you sure do you want to ${selectedStatus}`;
      modelRef.componentInstance.message = `${confirmText} confirmation`;
      modelRef.componentInstance.status.subscribe(resp => {
        ////console.log(resp,"RESP");
        
        if(resp == "ok"){
         this.updateStatus(content,status);
         modelRef.close();
        }
        else{
          modelRef.close();
        }
    })
  
  }

  }
  updateStatus(content,status){
   // //console.log(content,status,"STATUS CONTENT CHECK")
    this.user_id = JSON.parse(sessionStorage.getItem('user_id'))
     let date = new Date();
     let currDate =('0' +(date.getDate())).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/'  + date.getFullYear() 
     ////console.log( currDate," this.currDate")
    let method = status ==="APPROVED" ? "APPROVE" :"REJECT"
    let data ={
      user_id:this.user_id,
      module:"LEAVE/HOLIDAY_LIST",
      menu:"APPLIED/APPROVIED_LEAVES",
      method:method,
      id: content,
      approved_state: status,
      approved_by_id:this.user_id,
      approved_date:currDate
  }
 
  this.api.leaveApplicationState(data).subscribe(res =>{
    //console.log('emitt');
    let tableData ={
      page:this.page,
      tableSize:this.tableSize
     }
    this.buttonClick.emit(tableData);
    // if(res){
    //   this.buttonClick.emit(this.page);
    //   //console.log(res,"STATE CHANGE")
    // }
 
  })
  }
}

import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { TimesheetService } from 'src/app/service/timesheet.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  BreadCrumbsTitle:any='My timesheets ';
  timeSheetForm:FormGroup
  allDetails: any = [];
  params: any = {};
  pagination: { page_number: any; data_per_page: number; };
  page: any = 1;
  fromDate: any;
  toDate: any;
  changes: boolean;
  month: any;
  selectedTab: any;
  userId:any;
  count: number;
  cardData: any;
  p_FromDate= '2023-03-03';
  p_ToDate= '2023-03-30';
  totalCount: any;
  term:string;
  showSearch=false;
  @ViewChild('tabset') tabset: TabsetComponent;
  orgId: any;
  tableSize: any = 10;
  constructor(
    private _fb:FormBuilder,
    private api:ApiserviceService,
    private datepipe:DatePipe,
    private location:Location,private cdref: ChangeDetectorRef,
    private common_service:CommonServiceService) { }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  get f(){
    return this.timeSheetForm.controls;
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('org_id')
    this.userId = sessionStorage.getItem('user_id')
    let params={
      module:"TIMESHEET",
      menu:"PEOPLE_TIMESHEET",
      method:"VIEW",
      status:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
      user_id:this.userId,
      page_number:this.page,
      data_per_page:this.tableSize,
      search_key:'',
      organization_id:this.orgId
     }
     
      this.initForm()
      this.getByStatus(params)
      // Subscribe to from_date changes and enable/disable to_date
    
  }
 initForm(){
  this.timeSheetForm = this._fb.group({
    from_date:['',Validators.required],
    to_date:['',Validators.required]
  })
 }
  getByStatus(params){
   
     this.api.getData(`${environment.live_url}/${environment.time_sheets}?user_id=${this.userId}&module=TIMESHEET&menu=PEOPLE_TIMESHEET&method=VIEW&search_key=${params.search_key}&approved_state=${params.status}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=TRUE&organization_id=${this.orgId}`).subscribe((res:any)=>{
      if( res['result'].data.length >=1){
        this.allDetails = res['result']['data']
        this.cardData = res['result'].timesheet_dashboard
        this.totalCount = { pageCount: res['result']['pagination'].number_of_pages, currentPage: res['result']['pagination'].current_page,itemsPerPage:10};
      }
      else{
        res['result']['data'].length <=0 ? this.api.showWarning('No records found') : '';
        if(res['result'] && res['result'].timesheet_dashboard){
          this.cardData = res['result'].timesheet_dashboard    
        }
       }
     })
  }

  getAllTimeSheet(params){ 
    this.api.getData(`${environment.live_url}/${environment.time_sheets}?user_id=${this.userId}&module=TIMESHEET&menu=PEOPLE_TIMESHEET&method=VIEW&search_key=${params.search_key}&approved_state=${params.status}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&timesheets_from_date=${params.timesheets_from_date}&timesheets_to_date=${params.timesheets_to_date}&pagination=TRUE&organization_id=${this.orgId}`).subscribe((res:any)=>{
      if( res['result'].data.length >=1){
        this.allDetails = res['result']['data']
        this.cardData = res['result'].timesheet_dashboard
        this.totalCount = { pageCount: res['result']['pagination'].number_of_pages, currentPage: res['result']['pagination'].current_page,itemsPerPage:10};
        this.timeSheetForm.patchValue({
          from_date:this.datepipe.transform(this.cardData.from_date,'dd/MM/yyyy'),
          to_date:this.datepipe.transform(this.cardData.to_date,'dd/MM/yyyy')
        });
        //this.month   = this.cardData.from_date
      }
      else{
        res['result']['data'].length <= 0 ? this.api.showWarning('No records found') :''
        if(res['result'] && res['result'].timesheet_dashboard){
          this.cardData = res['result'].timesheet_dashboard    
        }
       }
      
    })

  }
  changeFormat(){
    this.fromDate = this.timeSheetForm.value.from_date
    this.toDate   = this.timeSheetForm.value.to_date
    this.changes  = true;
    this.month    = this.timeSheetForm.value.to_date
   }
   buttonClick(event){
    if(event){
      this.cdref.detectChanges();
      let c_params={}
      this.tableSize = event.tableSize
      if(this.changes){
        c_params={
          module:"TIMESHEET",
          menu:"PEOPLE_TIMESHEET",
          method:"VIEW",
          status:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
          user_id:this.userId,
          page_number:event.page,
          data_per_page:event.tableSize,
          search_key:event.search_key,
          organization_id:this.orgId,
          timesheets_to_date:this.datepipe.transform(this.toDate,'dd/MM/yyyy'),
          timesheets_from_date:this.datepipe.transform(this.fromDate,'dd/MM/yyyy') 
         }
         this.getAllTimeSheet(c_params);
      }
    else{
      c_params={
        module:"TIMESHEET",
        menu:"PEOPLE_TIMESHEET",
        method:"VIEW",
        status:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
        user_id:this.userId,
        organization_id:this.orgId,
        page_number:event.page,
        data_per_page:event.tableSize,
        search_key:event.search_key,
       }
       this.getByStatus(c_params)
    }
    
    }
  }
  searchFiter(event){
    if(event){
      this.cdref.detectChanges();
      let c_params={}
      if(this.changes){
        c_params={
          module:"TIMESHEET",
          menu:"PEOPLE_TIMESHEET",
          method:"VIEW",
          status:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
          user_id:this.userId,
          page_number:this.page,
          data_per_page:this.tableSize,
          search_key:this.term,
          organization_id:this.orgId,
          timesheets_to_date:this.datepipe.transform(this.toDate,'dd/MM/yyyy'),
          timesheets_from_date:this.datepipe.transform(this.fromDate,'dd/MM/yyyy') 
         }
      }
    else{
      c_params={
        module:"TIMESHEET",
        menu:"PEOPLE_TIMESHEET",
        method:"VIEW",
        status:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
        user_id:this.userId,
        organization_id:this.orgId,
        page_number:this.page,
        data_per_page:this.tableSize,
        search_key:this.term,
       }
       
    }
    this.allDetails = []
    this.getByStatus(c_params)
    }
    
  }
  async submit() {
    let c_params = {};
    this.month = this.timeSheetForm.value.to_date;
   
    // Check if form is valid before proceeding
    if (this.timeSheetForm.invalid) {
      this.timeSheetForm.markAllAsTouched(); // Show validation only if form is invalid
      return; // Exit the function early if invalid
    }else{
      // If changes exist and form is valid
      if (this.changes) {
        c_params = {
          module: "TIMESHEET",
          menu: "PEOPLE_TIMESHEET",
          method: "VIEW",
          status: this.selectedTab ? this.selectedTab : 'YET_TO_APPROVED',
          user_id: this.userId,
          organization_id: this.orgId,
          page_number: this.page,
          data_per_page: this.tableSize,
          search_key: '',
          timesheets_to_date: this.datepipe.transform(this.toDate, 'dd/MM/yyyy'),
          timesheets_from_date: this.datepipe.transform(this.fromDate, 'dd/MM/yyyy')
        };

        this.allDetails = [];
        this.getAllTimeSheet(c_params);  // Fetch the data
        this.timeSheetForm = await this._fb.group({
          from_date:[''],
          to_date:['']
        })
      }
    }
  
   
  }
  
    tabState(data){
      console.log(data,"DATA")
      if(data.tab.textLabel == 'Approved'){
        this.selectedTab = 'APPROVED'
      }
      else if(data.tab.textLabel == 'Pending' ){
        this.selectedTab = 'YET_TO_APPROVED' 
      }
      else if(data.tab.textLabel == 'Declined'){
        this.selectedTab = 'DECLINED'
      }
      else if(data.tab.textLabel == 'Flagged timesheets'){
        this.selectedTab = 'FLAGGED'
      }
      else{
        this.selectedTab = 'YET_TO_APPROVED' 
      }
      let c_params = {}
    if(this.changes){
      c_params={
        module:"TIMESHEET",
        menu:"PEOPLE_TIMESHEET",
        method:"VIEW",
        status:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
        user_id:this.userId,
        organization_id:this.orgId,
        page_number:this.page,
        data_per_page:this.tableSize,
        search_key:'',
        timesheets_to_date:this.datepipe.transform(this.toDate,'dd/MM/yyyy') ,
        timesheets_from_date:this.datepipe.transform(this.fromDate,'dd/MM/yyyy') 
       }
      
        this.getAllTimeSheet(c_params)
      
    }
    else{
      c_params={
        module:"TIMESHEET",
        menu:"PEOPLE_TIMESHEET",
        method:"VIEW",
        status:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
        user_id:this.userId,
        organization_id:this.orgId,
        page_number:this.page,
        data_per_page:this.tableSize,
        search_key:'',
      }
      this.getByStatus(c_params)
    }
   
    }
    refershPage(){
      let params={
        module:"TIMESHEET",
        menu:"PEOPLE_TIMESHEET",
        method:"VIEW",
        status:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
        user_id:this.userId,
        page_number:this.page,
        data_per_page:this.tableSize,
        search_key:'',
        organization_id:this.orgId
       }
       
        this.getByStatus(params)
    }

}

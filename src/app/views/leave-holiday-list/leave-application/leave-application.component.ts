import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';

import { environment } from 'src/environments/environment';
import { LocaleConfig } from 'ngx-daterangepicker-material';

import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { error } from 'console';
dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
window['dayjs'] = dayjs;
@Component({
  selector: 'app-leave-application',
  templateUrl: './leave-application.component.html',
  styleUrls: ['./leave-application.component.scss'],
})
export class LeaveApplicationComponent implements OnInit {
  leaveForm!: FormGroup;
  BreadCrumbsTitle: any = 'Apply';
  allLeave: any = [];
  leave: any;
  uploadFile: any;
  url: any;
  fileUrl: string | ArrayBuffer;
  user_id;
  balanceLeave: any;
  workingDays: number;
  min = new Date().toISOString().split('T')[0];
  ccSetting: {
    singleSelection: boolean;
    idField: string;
    textField: string;
    itemsShowLimit: number;
    allowSearchFilter: boolean;
  };
  allPeopleGroup: any;
  peopleId: any;
  leaveType: any = [];
  invalidDate: boolean = false;

  disableTextbox: boolean = true;
  disableTextbox2: boolean = true;

  leaveDetails: any = [];
  reservedDates: any = [];
  noLeaves: boolean = false;
  minDate: any;
  maxDate: any;
  orgId: any;
  fileDataUrl: string | ArrayBuffer | null = null;
  @ViewChild('fileInput') fileInput: ElementRef;
 // Dropdown data as array of objects
 
sessions = [
  { value: 'session1', viewValue: 'Session 1' },
  { value: 'session2', viewValue: 'Session 2' }
];
  leaveBalance: any;
  applyingDays: number;
  today: Date;
  allEmployees: any;
  constructor(
    private builder: FormBuilder,
    private api: ApiserviceService,
    private datepipe: DatePipe,
    private location: Location,
    private common_service: CommonServiceService
  ) { }
  d = dayjs();

  selected: any;
  locale: LocaleConfig | any = {
    applyLabel: 'Appliquer',
    customRangeLabel: ' - ',
  };
  onFileChange($event){}
  myFilter = (d: Date | null): boolean => {
    // Disable weekends
    const day = (d || new Date()).getDay();
    return day !== 0 && day !== 6;
  };

  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();
  }
  triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = JSON.parse(sessionStorage.getItem('user_id'));
    this.today = new Date()
    this.orgId = sessionStorage.getItem('organization_id')
    //this.getPeopleGroup();
    this.getLeaveType();
    this.getAllEmployee();
    this.initForm();
   // this.enableDatepicker();

   // this.getAllleaveData();
  }
  removeToDate(){
    this.leaveForm.patchValue({
      leaveApplication_to_date:''
    })
  }
  getLeaveBalance(){
    this.api.getData(`${environment.live_url}/${environment.employee_leaves}/?employee-id=${this.user_id}&leave-type-id=${this.leaveForm.value.leave_type_id}`).subscribe((res:any)=>{
      if(res){
        this.leaveBalance = res?.[0]['total_number_of_leaves']
      }
    })
  }
  getAllleaveData() {
    let params = {
      pagination: 'FALSE',
    };
    let user_id = sessionStorage.getItem('user_id');
    this.api
      .getData(
        `${environment.live_url}/${environment.users_leave_details}?user_id=${user_id}&method=VIEW&menu=MY_LEAVES&module=LEAVE/HOLIDAY_LIST&page_number=1&data_per_page=2&pagination=${params.pagination}&organization_id=${this.orgId}`
      )
      .subscribe(
        (res: any) => {
          if (res.result.data) {
            this.leaveDetails = res.result.data;
            this.leaveDetails.forEach((element) => {
              // this.reservedDates.push({
              //   fromDate: this.datepipe.transform(element.leaveApplication_from_date * 1000, 'yyyy-MM-dd'),
              //   toDate: this.datepipe.transform(element.leaveApplication_to_date * 1000, 'yyyy-MM-dd')
              // });
              this.reservedDates.push(
                this.datepipe.transform(
                  element.leaveApplication_from_date * 1000,
                  'yyyy-MM-dd'
                )
              );
            });
          }

          //console.log(this.reservedDates,"FROMDATE")
        },
        (err) => {
          this.api.showError(err.error.error.message);
        }
      );
  }
 
  toggleDisable(event) {
    if (event == 'from_date') {
      this.disableTextbox2 = false;
      this.leaveForm.patchValue({
        leaveApplication_to_date: '',
      });
      //this.invalidDate = false;
    } else if (event == "from1_session") {
      this.leaveForm.patchValue({
        leaveApplication_to_date: '',
        from1_session: ''
      })
    } else {
      this.disableTextbox2 = true;
      if (event == 'leave_type_id') {
        this.disableTextbox = false;
        this.leaveForm.patchValue({
          leaveApplication_from_date: '',
          leaveApplication_to_date: '',
          from1_session: '',
          to1_session: '',
          balance: '',
          days: '',
        });
        // this.disableTextbox2 = true;
      }
    }
  }
  getLeaveType() {
    
    this.api.getData(`${environment.live_url}/${environment.leave_master}/?employee-id=${this.user_id}`).subscribe(
      (data: any) => {
        this.leaveType = data;
      },
      (error) => {
        this.api.showError(error?.error?.message);
      }
    );
  }
  endDateValidator(): any {
    const yearStartDate =
      new Date(
        this.leaveForm.get('leaveApplication_from_date').value
      ).getTime() /
      (1000 * 60);
    const yearEndDate =
      new Date(this.leaveForm.get('leaveApplication_to_date').value).getTime() /
      (1000 * 60);
    if (yearStartDate > yearEndDate) {
      this.invalidDate = true;
    } else {
      this.invalidDate = false;
    }
    this.leaveForm.patchValue({
      to1_session: '',
      balance: '',
      days: '',
    });
  }

  initForm() {
    this.leaveForm = this.builder.group({
      reason: ['', [Validators.pattern(/^\S.*$/), Validators.required]],
      leave_application_file_attachment: ['',[Validators.required,this.fileFormatValidator]],
      cc_to: ['', Validators.required],
      leaveApplication_from_date: ['', [Validators.required]],
      leaveApplication_to_date: ['', [Validators.required]],
      leave_type_id: ['', [Validators.required]],
      from1_session: ['', [Validators.required]],
      to1_session: ['', [Validators.required]],
     
      applying_to:['',[Validators.required]]
    });
    
  }
  calculateApplyingDays() {
    const fromDate = this.leaveForm.get('leaveApplication_from_date')?.value;
    const fromSession = this.leaveForm.get('from1_session')?.value;
    const toDate = this.leaveForm.get('leaveApplication_to_date')?.value;
    const toSession = this.leaveForm.get('to1_session')?.value;

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      // Calculate the difference in days
      let diffInTime = to.getTime() - from.getTime();
      let diffInDays = diffInTime / (1000 * 3600 * 24);

      // If the fromDate and toDate are the same day
      if (from.getTime() === to.getTime()) {
        if (fromSession === toSession) {
          // If sessions are the same on the same day, it counts as 0.5 days
          this.applyingDays = 0.5;
        } else {
          // If sessions are different on the same day, it counts as 1 full day
          this.applyingDays = 1;
        }
      } else {
        // For different dates, adjust for sessions
        if (fromSession === 'session2') {
          // If starting with the afternoon session, subtract 0.5 day
          diffInDays -= 0.5;
        }

        if (toSession === 'session1') {
          // If ending with the morning session, subtract 0.5 day
          diffInDays -= 0.5;
        }

        // Set the number of applying days (add 1 to include the first day)
        this.applyingDays = diffInDays + 1;
      }
    }
  }

  submit(){
   
    
    const data = {
      leave_type: this.leaveForm.value.leave_type_id,
      number_of_leaves_applying_for: this.applyingDays,
      from_date: this.datepipe.transform(this.leaveForm.value.leaveApplication_from_date,'yyyy-MM-dd'),
      to_date: this.datepipe.transform(this.leaveForm.value.leaveApplication_to_date,'yyyy-MM-dd'),
      reporting_to: this.leaveForm.value.applying_to,
      cc: JSON.stringify(this.leaveForm.value.cc_to), 
      employee: this.user_id,
      attachment: this.fileUrl,
      message: this.leaveForm.value.reason
    };
    if(this.leaveForm.invalid){
      this.leaveForm.markAllAsTouched()
    }else{
      if(this.applyingDays > this.leaveBalance){
        this.api.showWarning(`Applied leaves should not exceed the available leave balance`);
      }else{
        this.api.postData(`${environment.live_url}/${environment.apply_leave}/`,data).subscribe((res:any)=>{
          if(res){
            this.api.showSuccess('Leave application created successfully!')
            this.ngOnInit()
            this.applyingDays = 0
            this.leaveBalance = ""
            this.fileDataUrl = ""
          }
         },(error)=>{
          this.api.showError(error?.error?.message)
         })
      }
   
    }
  }
  
  fileFormatValidator(control: AbstractControl): ValidationErrors | null {
    const allowedFormats = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
    const file = control.value;
    if (file) {
      const fileExtension = file.substr(file.lastIndexOf('.')).toLowerCase();
      if (!allowedFormats.includes(fileExtension)) {
        return { accept: true };
      }
    }
    return null;
  }

  get f() {
    return this.leaveForm.controls;
  }
  uploadImageFile(event: any) {
    this.uploadFile = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.fileUrl = reader.result;
        this.fileDataUrl = reader.result
        // this.leaveForm.patchValue({
        //   leave_application_file_attachment: this.fileUrl,
        // });
      };
    }
  }

  getBalance(workingdays) {
    let data = {
      leave_title: this.leaveForm.value.leave_type_id,
      description: this.leaveForm.value.reason,
      accrude_monthly: false,
      monthly_leaves: '',
      yearly_leaves: 20,
      carry_forward_per: '',
      gracefull_days: 2,
      encashment: false,
      max_encashments: '',
      leave_applicable_for: 1,
    };

    let params = {
      user_id: this.user_id,
      days: workingdays,
      leave_type_id: this.leaveForm.value.leave_type_id,
      from_date: this.leaveForm.value.leaveApplication_from_date,
      to_data: this.leaveForm.value.leaveApplication_to_date,
      from_session: this.leaveForm.value.from1_session,
      to_session: this.leaveForm.value.to1_session
    };
    this.api.getLeaveBalance(params, data).subscribe(
      (res) => {
        this.balanceLeave = res['result'].balance_days;
        this.noLeaves = false;
        this.leaveForm.patchValue({
          balance: this.balanceLeave ? this.balanceLeave : 0,
        });
      },
      (error: any) => {
        this.noLeaves = true;
        this.api.showError(error.error.message);
      }
    );
  }
  getappliedLeave() {
    let holidayParams = {
      date: '01/01/2023',
      country: 'IN',
      state: 'KA',
    };
    this.api.getHolidayList(holidayParams).subscribe((res) => {
      const holidays = res;
      //console.log(holidays,"yutre")
      const startDate = new Date(
        this.leaveForm.value.leaveApplication_from_date
      );
      const endDate = new Date(this.leaveForm.value.leaveApplication_to_date);
      const selectedFrom = this.leaveForm.value.from1_session;
      const selectedTo = this.leaveForm.value.to1_session;
      this.workingDays = this.getWorkingDays(
        startDate,
        endDate,
        holidays,
        selectedFrom,
        selectedTo
      );
      //console.log( this.workingDays,"WORKING DAYS")

      // if (this.workingDays === 1) {
      //  // //console.log(selectedFrom,selectedTo)
      //   this.workingDays = selectedFrom === selectedTo ? 0.5: 1 ;
      //   this.leaveForm.patchValue({
      //     days:this.workingDays
      //    })
      //  }
      //  else{
      //   if(this.workingDays === 2 && selectedFrom === selectedTo){
      //     this.workingDays = 1.5
      //     this.leaveForm.patchValue({
      //       days:this.workingDays
      //      })

      //   }
      //   else{
      //     if(selectedFrom === selectedTo){
      //       this.workingDays = (this.workingDays - 0.5)
      //       this.leaveForm.patchValue({
      //         days:this.workingDays
      //        })
      //     }else{
      //       this.leaveForm.patchValue({
      //         days:this.workingDays
      //        })
      //     }
      //   }

      //  }
      this.leaveForm.patchValue({
        days: this.workingDays,
      });
      console.log(`Number of working days: ${this.workingDays}`);

      //console.log(this.leaveForm.value.days,"DAYS")
      this.getBalance(this.workingDays);
    });
  }
  getAllEmployee(){
    const organization_id =  53
    this.api.getData(`${environment.live_url}/${environment.all_employee}/?organization_id=${organization_id}`).subscribe((res:any)=>{
      if(res){
        this.allEmployees = res
      }
    },(error)=>{
      this.api.showError(error?.error?.message)
    })
  }

  getWorkingDays(
    startDate: Date,
    endDate: Date,
    _holidays,
    selectedFrom: string,
    selectedTo: string
  ): any {
    const fromDate = dayjs(new Date(startDate));
    const toDate = dayjs(new Date(endDate)).subtract(1, 'day');
    const fromToDuration = dayjs.duration(toDate.diff(fromDate)).asDays()
    const fromDaySession = fromDate.subtract(
      selectedFrom === '1' ? 24 : 12,
      'hours'
    );
    const toDaySession = toDate.add(selectedTo === '1' ? 12 : 24, 'hours');
    const diffMS = toDaySession.diff(fromDaySession);
    const daysDiff = dayjs.duration(diffMS).asDays();
    const holidays = Object.values(_holidays?.message[0]);
    let daysDiffWithHolidays = daysDiff
    // Exclude weekends from the leaves
    console.log(daysDiff)
    for (let i = 0; i < daysDiff; i++) {
      const currentDay = fromDate.add(i, 'days').format('dddd')
      const holidayDate = fromDate.add(i, 'days').format('DD/MM/YYYY')
      const isHoliday = holidays.includes(holidayDate)
      console.log("CURRENT DAY", currentDay)
      if (currentDay === 'Saturday' || currentDay === 'Sunday' || isHoliday) {
        daysDiffWithHolidays--;
      }
    }
    return daysDiffWithHolidays;
  }

  onPeopleSelect(event: any) {
    this.peopleId.push(event.id);
  }
  

}

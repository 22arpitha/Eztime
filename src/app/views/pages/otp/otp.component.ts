import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { error } from 'console';
import { ApiserviceService } from 'src/app/service/apiservice.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit {
  otpForm: FormGroup;
  @ViewChild('el', { static: false }) el: ElementRef;
  @ViewChild('num3', { static: false }) num3: ElementRef;

  constructor(private builder: FormBuilder, private api: ApiserviceService, private router: Router) { }

  ngOnInit(): void {
    this.initForm();

  }
  initForm() {
    this.otpForm = this.builder.group({
      num1: ['', Validators.required],
      num2: ['', Validators.required],
      num3: ['', Validators.required],
      num4: ['', Validators.required],
      num5: ['', Validators.required],
      num6: ['', Validators.required],
    })
  }
  sendOTP() {
    let int = this.otpForm.value.num1
    const otp: string = int.concat(this.otpForm.value.num2, this.otpForm.value.num3, this.otpForm.value.num4, this.otpForm.value.num5, this.otpForm.value.num6)
    const userName = sessionStorage.getItem('email_id')
    const otpdata = {
      OTP: otp,
      username: userName
    }
    if (this.otpForm.invalid) {
      this.api.showError('Invalid')

    }
    else {
      this.api.otp(otpdata).subscribe((res: any) => {
        if (res['result']['message'] == 'OTP matches successfully') {
          this.api.showSuccess(res['result']['message'])
          this.router.navigate(['/forgotChange']);
        }
        else {
          if (res['error']['message'] === 'Invalid OTP') {
            this.api.showError('Invalid OTP')
          }
        }


      }, (error => {
        this.api.showError(error.error.error.message)
      }))
    }


  }


  handleBackspace(event, currentControlName) {
    //console.log(event,event.key,"EVENT>KEY")
    if (event.keyCode === 8 || event.keyCode === 46) {
      event.preventDefault();
      const currentControl = this.otpForm.get(currentControlName);
      currentControl.setValue("");

      const previousControlName = this.getPreviousControlName(currentControlName);
      if (previousControlName) {
        const previousControl = this.otpForm.get(previousControlName);
        this.setFocus(previousControlName);
        previousControl.setValue("");
      }
    }
  }

  getPreviousControlName(currentControlName) {
    const controlNames = Object.keys(this.otpForm.controls);
    const currentIndex = controlNames.indexOf(currentControlName);
    if (currentIndex > 0) {
      return controlNames[currentIndex - 1];
    }
    return null;
  }

  setFocus(controlName) {
    const invalidControl = this.el.nativeElement.querySelector('[formControlName="' + controlName + '"]');
    if (invalidControl) {
      invalidControl.focus();
    }
  }

  valCheck() {
    for (const key of Object.keys(this.otpForm.controls)) {
      if (this.otpForm.controls[key].invalid) {
        this.setFocus(key);
        break;
      }
    }
  }


  // valCheck() {
  //   for (const key of Object.keys(this.otpForm.controls)) {
  //     if (this.otpForm.controls[key].invalid) {
  //       var invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');
  //       invalidControl.focus();
  //       break;
  //     }
  //   }
  // }



}

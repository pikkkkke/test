import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { LoginComponent } from './login/login.component';
// import { SignupComponent } from './signup/signup.component';
// import { ProfileComponent } from './profile/profile.component';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInput, MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list'
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatError } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
// import { FavoritesComponent } from './favorites/favorites.component';
// import { FollowsComponent } from './follows/follows.component';
// import { InfoComponent } from './info/info.component'
import { MatTableModule } from '@angular/material/table'
import { IndexComponent } from './index/index.component';
import { SignupComponent } from './signup/signup.component';
import { MatIcon, MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { NumberFormatPipe } from '../pipes/number-format.pipe';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProfileComponent } from './profile/profile.component';
import { UploadComponent } from './upload/upload.component'
import { MatStepperModule } from '@angular/material/stepper'
@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    IndexComponent,
    ProfileComponent,
    UploadComponent

  ],
  imports: [
    MatInputModule,
    CommonModule,
    MatGridListModule,
    UserRoutingModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatStepperModule,
    MatPaginatorModule,
    NumberFormatPipe,

  ]
})
export class UserModule { }

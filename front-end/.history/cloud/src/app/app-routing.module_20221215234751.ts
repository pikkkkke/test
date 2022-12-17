import { NgModule } from '@angular/core';
import { InitialNavigation, RouterModule, Routes } from '@angular/router';
import { NotfoundComponent } from './notfound/notfound.component';
import { PageloadingService } from './pageloading.service';

const routes: Routes = [
  { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule), data: { preload: true } },
  { path: "**", component: NotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: "enabled" as InitialNavigation,
    preloadingStrategy: PageloadingService
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AngularFontAwesomeModule} from 'angular-font-awesome';

import {AppComponent} from './app.component';
import {SocketService} from './shared/socket.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AngularFontAwesomeModule
  ],
  providers: [
    SocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

import {Component, OnInit} from '@angular/core';
import {SocketService} from './shared/socket.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [SocketService]
})
export class AppComponent implements OnInit {
  user = null;
  constructor(private socket: SocketService) {}

  ngOnInit() {
    this.socket.registerListener({ event: 'user', actions: {
      login: this.userLogin.bind(this),
      logout: this.userLogout.bind(this)
    }});
  }

  userLogin(msg) {
    this.user = msg.user;
    console.log('Logged in:', this.user);
  }

  userLogout() {
    console.log('Logged out:', this.user);
    this.user = null;
  }

}

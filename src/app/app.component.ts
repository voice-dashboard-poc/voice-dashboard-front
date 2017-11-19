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

  public module: string = null;

  private myLog = new Logs();
  public logs: Array<log> = [];

  private myCustomers = new Customers();
  public customers: Array<customer> = [];
  public customer: customer = null;

  private myBudget = new Budget();
  public budget: Array<budget> = [];

  constructor(private socket: SocketService) {}

  ngOnInit() {
    this.socket.registerListener({ event: 'user', actions: {
      login: this.userLogin.bind(this),
      logout: this.userLogout.bind(this)
    }});

    this.socket.registerListener({ event: 'module', actions: {
      open: this.openModule.bind(this),
      close: this.openModule.bind(this)
    }});

    this.socket.registerListener({ event: 'logs', actions: {
      filter: this.filterLogs.bind(this)
    }});

    this.socket.registerListener({ event: 'customers', actions: {
      filter: this.filterCustomers.bind(this),
      show: this.showCustomer.bind(this)
    }});

    this.logs = this.myLog.getLogs();
    this.customers = this.myCustomers.getCustomers();
    this.budget = this.myBudget.filterBudget();
  }

  // MODULES
  openModule(msg) {
    if (msg && msg.module && this.user) {
      if (this.module === null) {
        this.module = msg.module;
      }
    } else {
      this.module = null;
    }
  }

  // USER
  userLogin(msg) {
    this.user = msg.user;
    console.log('Logged in:', this.user);
  }

  userLogout() {
    console.log('Logged out:', this.user);
    this.user = null;
    this.module = null;
  }

  // CUSTOMERS
  filterCustomers(msg) {
    this.customer = null;
    this.customers = this.myCustomers.getCustomers(msg.params.country);
  }
  showCustomer(msg) {
    this.customer = this.myCustomers.getCustomer(parseInt(msg.customer));
  }

  // LOGS
  filterLogs(msg) {
    this.logs = this.myLog.getLogs(msg.params.level);
  }

}

// BUDGET
interface budget {
  year: number,
  month: string,
  budget: number,
  earn: number,
  expenses: number
}

class Budget {
  private months: Array<string> = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  private years: Array<number> = [2017, 2016];
  private budgetData: Array<budget> = [];

  constructor() {
    this.generateRandomBudgetData();
  }

  private generateRandomBudgetData(): void {
    this.years.forEach((year) => {
      this.months.forEach((month) => {
        this.budgetData.push({
          year,
          month,
          budget: Budget.getRandomInt(100000, 200000),
          earn: Budget.getRandomInt(15000, 50000),
          expenses: Budget.getRandomInt(12000, 30000),
        })
      })
    });
  }

  public filterBudget(params?): Array<budget> {
    return this.budgetData;
  }

  private static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// CUSTOMERS
interface customer {
  id: number,
  fullName: string,
  country: string,
  birthDate: string,
  sex: string
}

class Customers {
  private firstNames: Array<string> = ['Judson','Tyron','Eugena','Johnetta','Perla','Jerrold','Dominique','Barbie','Darla','Hanna','Kelsi','Desirae','Ta','Gina','Natasha','Patrice','Margery','Rose','Graig','Alvera','Antwan','Corliss','Brandie','Cherilyn','Kimi','Honey','Noemi','Anisha','Ardelia','Susann','Garth','Chantel','Marylin','Ardell','Chi','Giuseppina','Gricelda','Suzette','Keila','Earlean','Alejandrina','Aurore','Harmony','Kristyn','Corie','Sanjuana','Whitley','Maryln','Ha','Alec'];
  private lastNames: Array<string> = ['Koerner','Hicklin','Throneberry','Merlin','Ennis','Brandi','Lex','Horn','Papageorge','Miltenberger','Eaves','Trumbauer','Cobble','Stamps','Wong','Hardage','Benzing','Bramwell','Wendell','Botta','Lander','Tedeschi','Steffensen','Valentin','Eichhorn','Oertel','Cirillo','Clack','Stover','Bendixen','Muller','Claunch','Huckstep','Student','Ranum','Margolis','Ng','Rothchild','Adkins','Statham','Beltz','Raffield','Yohn','Burgio','Widmer','Briski','Ryan','Shiba','Fleagle','Schnur'];
  private countries: Array<string> = ['ESP', 'USA', 'DEU'];
  private sex: Array<string> = ['M', 'F'];
  private customers: Array<customer> = [];
  private TOTAL_CUSTOMERS: number = 30;

  constructor() {
    this.generateRandomCustomers();
  }

  private generateRandomCustomers(): void {
    for (let i = 0; i < this.TOTAL_CUSTOMERS; i++) {
      this.customers.push({
        id: Math.floor(Math.random() * 1000),
        fullName: this.firstNames[Math.floor(Math.random() * this.firstNames.length)] + ' ' + this.lastNames[Math.floor(Math.random() * this.lastNames.length)],
        country: this.countries[Math.floor(Math.random() * this.countries.length)],
        birthDate: Customers.randomDate(new Date(1970, 0, 1), new Date(1990, 0, 1)),
        sex: this.sex[Math.floor(Math.random() * this.sex.length)],
      });
    }
  }

  public getCustomers(country?: string): Array<customer> {
    if (country && this.countries.includes(country.toUpperCase())) {
      return this.customers.filter((customer) => customer.country.toUpperCase() === country.toUpperCase())
    }
    return this.customers;
  }

  public getCustomer(id: number): customer {
    return this.customers.find((customer) => customer.id === id);
  }

  private static randomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toDateString();
  }
}

// LOGS
interface log {
  date: string,
  type: string,
  service: string
}

class Logs {
  private services: Array<string> = ['accounts', 'cards', 'transactions', 'users', 'auth', 'billing'];
  private types: Array<string> = ['ERROR', 'WARNING', 'SUCCESS'];
  private logs: Array<log> = [];
  private TOTAL_LOGS: number = 100;
  constructor() {

    this.generateRandomLogs();
  }

  private generateRandomLogs(): void {
    for (let i = 0; i < this.TOTAL_LOGS; i++) {
      this.logs.push({
        date: Logs.randomDate(new Date(2012, 0, 1), new Date()),
        type: this.types[Math.floor(Math.random() * this.types.length)],
        service: this.services[Math.floor(Math.random() * this.services.length)]
      });
    }
  }

  public getLogs(type?: string): Array<log> {
    if (type && this.types.includes(type.toUpperCase())) {
      return this.logs.filter((log) => log.type.toUpperCase() === type.toUpperCase())
    }
    return this.logs;
  }

  private static randomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toDateString();
  }

}




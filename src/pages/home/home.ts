import { Component, ViewChild } from "@angular/core";
import { NavController, App, AlertController } from "ionic-angular";
import { AuthService } from "../../providers/auth-service";
import { Common } from "../../providers/common";

@Component({ selector: "page-home", templateUrl: "home.html" })
export class HomePage {
  @ViewChild("updatebox") updatebox;
  public userDetails: any;
  public resposeData: any;
  public dataSetCmd: any;
  public dataSetMenu: any;
  public totalPrice: any;
  public noRecords: boolean;
  userPostData = {
    user_id: "",
    token: "",
    cmd: "",
    cmd_id: "",
    lastCreated: "",
    lastMenu: "",
    price:""
  };
  menuPostData = {
    menu_id: "",
    name: "",
    price: "",
    type: ""
  };
  public nbItemCmd: any;

  constructor(
    public common: Common,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public app: App,
    public authService: AuthService
  ) {
    const data = JSON.parse(localStorage.getItem("userData"));
    this.userDetails = data.userData;
    this.userPostData.user_id = this.userDetails.user_id;
    this.userPostData.token = this.userDetails.token;
    this.userPostData.lastCreated = "";
    this.userPostData.lastMenu = "0";
    this.noRecords = false;
    this.totalPrice = 0;
    this.getCmd();
    this.getMenu();
  }

  getCmd() {
    //this.common.presentLoading();
    this.authService.postData(this.userPostData, "cmd").then(
      result => {
        this.resposeData = result;
        if (this.resposeData.cmdData) {
          //this.common.closeLoading();
          this.dataSetCmd = this.resposeData.cmdData;
          console.log(this.dataSetCmd);

          const dataLength = this.resposeData.cmdData.length;
          this.nbItemCmd = dataLength;

          for (let i = 0; i < dataLength; i++) {
            this.totalPrice = parseInt(this.totalPrice) + parseInt(this.resposeData.cmdData[i].price);
          }

          this.userPostData.lastCreated = this.resposeData.cmdData[dataLength - 1].created;

        } else {
          console.log("No access 1");
          //this.logout();
        }
      },
      err => {
        //Connection failed message
      }
    );
  }

  cmdUpdate() {
    if (this.userPostData.cmd) {
      this.common.presentLoading();
      this.authService.postData(this.userPostData, "cmdUpdate").then(
        result => {
          this.resposeData = result;
          if (this.resposeData.cmdData) {
            this.common.closeLoading();
            this.dataSetCmd.unshift(this.resposeData.cmdData);
            this.userPostData.cmd = "";

            //this.updatebox.setFocus();
            setTimeout(() => {
              //  this.updatebox.focus();
            }, 150);
          } else {
            console.log("No access 2");
          }
        },
        err => {
          //Connection failed message
        }
      );
    }
  }

  cmdUpdate2(varPst, price) {
    price = parseInt(price);
    this.userPostData.cmd = varPst;
    this.userPostData.price = price;
    if (this.userPostData.cmd) {
      this.common.presentLoading();
      this.authService.postData(this.userPostData, "cmdUpdate").then(
        result => {
          this.resposeData = result;
          if (this.resposeData.cmdData) {

            this.common.closeLoading();
            this.dataSetCmd.unshift(this.resposeData.cmdData);
            
            //const dataLength = this.resposeData.cmdData.length;
            this.nbItemCmd  = this.nbItemCmd + 1;
            this.totalPrice = parseInt(this.totalPrice) + price;

            //this.updatebox.setFocus();
            setTimeout(() => {
              //  this.updatebox.focus();
            }, 150);
          } else {
            console.log("No access 2");
          }
        },
        err => {
          //Connection failed message
        }
      );
    }
  }


  cmdDelete(cmd_id, price, msgIndex) {
    if (cmd_id > 0) {
      let alert = this.alertCtrl.create({
        title: "Delete Cmd",
        message: "Do you want to buy this cmd?",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              console.log("Cancel clicked");
            }
          },
          {
            text: "Delete",
            handler: () => {
              this.userPostData.cmd_id = cmd_id;
              this.authService.postData(this.userPostData, "cmdDelete").then(
                result => {
                  this.resposeData = result;
                  if (this.resposeData.success) {
                    this.dataSetCmd.splice(msgIndex, 1);
                    this.nbItemCmd = this.nbItemCmd - 1;
                    this.totalPrice = parseInt(this.totalPrice) - price;
                  } else {
                    console.log("No access 3");
                  }
                },
                err => {
                  //Connection failed message
                }
              );
            }
          }
        ]
      });
      alert.present();
    }
  }

  getMenu() {
    this.common.presentLoading();
    this.authService.postData(this.userPostData, "menu").then(
      result => {
        this.resposeData = result;
        if (this.resposeData.menuData) {
          this.common.closeLoading();
          this.dataSetMenu = this.resposeData.menuData;
          console.log(this.dataSetMenu);
          this.userPostData.lastMenu = "5";
        } else {
          console.log("No access 1");
          //this.logout();
        }
      },
      err => {
        //Connection failed message
      }
    );
  }

  doInfinite(e): Promise<any> {
    console.log("Begin async operation");
      return new Promise(resolve => {
      setTimeout(() => {
        this.authService.postData(this.userPostData, "menu").then(
          result => {
            this.resposeData = result;
            if (this.resposeData.menuData.length) {
              const newData2 = this.resposeData.menuData;

              this.userPostData.lastMenu = this.resposeData.menuData[
                newData2.length - 1
              ].menu_id;
              console.log("this.userPostData.lastMenu "+this.userPostData.lastMenu);

              for (let i = 0; i < newData2.length; i++) {
                this.dataSetMenu.push(newData2[i]);
              }
            } else {
              this.noRecords = true;
              console.log("No updates");
            }
          },
          err => {
            //Connection failed message
          }
        );
        resolve();
      }, 400);
    });
  }

  converTime(time) {
    let a = new Date(time * 1000);
    return a;
  }

  backToWelcome() {
    const root = this.app.getRootNav();
    root.popToRoot();
  }

  logout() {
    //Api Token Logout
    localStorage.clear();
    setTimeout(() => this.backToWelcome(), 1000);
    this.backToWelcome();
  }

}

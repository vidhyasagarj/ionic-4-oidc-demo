import { Platform } from '@ionic/angular';
import { Injectable, NgZone } from '@angular/core';

import { IonicAuth } from 'ionic-appauth';
import { StorageService } from './angular/storage.service';
import { RequestorService } from './angular/requestor.service';
import { CordovaBrowser, CordovaRequestor, CordovaSecureStorage } from 'ionic-appauth/lib/cordova';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends IonicAuth {

  constructor(requestor: RequestorService, storage: StorageService,
              private platform: Platform, private ngZone: NgZone) {
    super((platform.is('cordova')) ? new CordovaBrowser() : undefined,
      (platform.is('cordova')) ? new CordovaSecureStorage() : storage,
      (platform.is('cordova')) ? new CordovaRequestor() : requestor);

    this.addConfig();
  }

  public async startUpAsync() {
    if (this.platform.is('cordova')) {
      (<any>window).handleOpenURL = (callbackUrl) => {
        this.ngZone.run(() => {
          this.handleCallback(callbackUrl);
        });
      };
    }

    super.startUpAsync();
  }

  private addConfig() {
    const clientId = 'bills2u_payer_test_mobile';
    const issuer = 'https://identity.ringgitpay.co/';
    const scopes = 'openid profile';

    if (this.platform.is('cordova') || this.platform.is('mobile')) {
      this.authConfig = {
        identity_client: clientId,
        identity_server: issuer,
        redirect_url: 'co.ringgitpay.sample:/callback',
        scopes: scopes,
        usePkce: true,
        end_session_redirect_url: 'co.ringgitpay.sample:/logout',
      };
    } else {
      this.authConfig = {
        identity_client: clientId,
        identity_server: issuer,
        redirect_url: 'http://localhost:44312/implicit/callback',
        scopes: scopes,
        usePkce: true,
        response_type: 'code',
        end_session_redirect_url: 'http://localhost:44312/implicit/logout',
      };
    }
  }

  private handleCallback(callbackUrl: string): void {
    if ((callbackUrl).indexOf(this.authConfig.redirect_url) === 0) {
      // todo: don't ignore promise or refactor
      this.AuthorizationCallBack(callbackUrl);
    }

    if ((callbackUrl).indexOf(this.authConfig.end_session_redirect_url) === 0) {
      this.EndSessionCallBack();
    }
  }
}

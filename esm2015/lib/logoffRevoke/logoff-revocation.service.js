import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../api/data.service";
import * as i2 from "../storage/storage-persistance.service";
import * as i3 from "../logging/logger.service";
import * as i4 from "../utils/url/url.service";
import * as i5 from "../iframe/check-session.service";
import * as i6 from "../flows/flows.service";
import * as i7 from "../utils/redirect/redirect.service";
export class LogoffRevocationService {
    constructor(dataService, storagePersistanceService, loggerService, urlService, checkSessionService, flowsService, redirectService) {
        this.dataService = dataService;
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.checkSessionService = checkSessionService;
        this.flowsService = flowsService;
        this.redirectService = redirectService;
    }
    // Logs out on the server and the local client.
    // If the server state has changed, checksession, then only a local logout.
    logoff(urlHandler) {
        this.loggerService.logDebug('logoff, remove auth ');
        const endSessionUrl = this.getEndSessionUrl();
        this.flowsService.resetAuthorizationData();
        if (!endSessionUrl) {
            this.loggerService.logDebug('only local login cleaned up, no end_session_endpoint');
            return;
        }
        if (this.checkSessionService.serverStateChanged()) {
            this.loggerService.logDebug('only local login cleaned up, server session has changed');
        }
        else if (urlHandler) {
            urlHandler(endSessionUrl);
        }
        else {
            this.redirectService.redirectTo(endSessionUrl);
        }
    }
    logoffLocal() {
        this.flowsService.resetAuthorizationData();
    }
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    logoffAndRevokeTokens(urlHandler) {
        var _a;
        if (!((_a = this.storagePersistanceService.read('authWellKnownEndPoints')) === null || _a === void 0 ? void 0 : _a.revocationEndpoint)) {
            this.loggerService.logDebug('revocation endpoint not supported');
            this.logoff(urlHandler);
        }
        if (this.storagePersistanceService.getRefreshToken()) {
            return this.revokeRefreshToken().pipe(switchMap((result) => this.revokeAccessToken(result)), catchError((error) => {
                const errorMessage = `revoke token failed`;
                this.loggerService.logError(errorMessage, error);
                return throwError(errorMessage);
            }), tap(() => this.logoff(urlHandler)));
        }
        else {
            return this.revokeAccessToken().pipe(catchError((error) => {
                const errorMessage = `revoke access token failed`;
                this.loggerService.logError(errorMessage, error);
                return throwError(errorMessage);
            }), tap(() => this.logoff(urlHandler)));
        }
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. If no token is provided, then the token from
    // the storage is revoked. You can pass any token to revoke. This makes it possible to
    // manage your own tokens. The is a public API.
    revokeAccessToken(accessToken) {
        const accessTok = accessToken || this.storagePersistanceService.getAccessToken();
        const body = this.urlService.createRevocationEndpointBodyAccessToken(accessTok);
        const url = this.urlService.getRevocationEndpointUrl();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError((error) => {
            const errorMessage = `Revocation request failed`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeRefreshToken(refreshToken) {
        const refreshTok = refreshToken || this.storagePersistanceService.getRefreshToken();
        const body = this.urlService.createRevocationEndpointBodyRefreshToken(refreshTok);
        const url = this.urlService.getRevocationEndpointUrl();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError((error) => {
            const errorMessage = `Revocation request failed`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    getEndSessionUrl() {
        const idToken = this.storagePersistanceService.getIdToken();
        return this.urlService.createEndSessionUrl(idToken);
    }
}
LogoffRevocationService.ɵfac = function LogoffRevocationService_Factory(t) { return new (t || LogoffRevocationService)(i0.ɵɵinject(i1.DataService), i0.ɵɵinject(i2.StoragePersistanceService), i0.ɵɵinject(i3.LoggerService), i0.ɵɵinject(i4.UrlService), i0.ɵɵinject(i5.CheckSessionService), i0.ɵɵinject(i6.FlowsService), i0.ɵɵinject(i7.RedirectService)); };
LogoffRevocationService.ɵprov = i0.ɵɵdefineInjectable({ token: LogoffRevocationService, factory: LogoffRevocationService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(LogoffRevocationService, [{
        type: Injectable
    }], function () { return [{ type: i1.DataService }, { type: i2.StoragePersistanceService }, { type: i3.LoggerService }, { type: i4.UrlService }, { type: i5.CheckSessionService }, { type: i6.FlowsService }, { type: i7.RedirectService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nb2ZmLXJldm9jYXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2xvZ29mZlJldm9rZS9sb2dvZmYtcmV2b2NhdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7QUFVNUQsTUFBTSxPQUFPLHVCQUF1QjtJQUNsQyxZQUNVLFdBQXdCLEVBQ3hCLHlCQUFvRCxFQUNwRCxhQUE0QixFQUM1QixVQUFzQixFQUN0QixtQkFBd0MsRUFDeEMsWUFBMEIsRUFDMUIsZUFBZ0M7UUFOaEMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDeEMsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIsb0JBQWUsR0FBZixlQUFlLENBQWlCO0lBQ3ZDLENBQUM7SUFFSiwrQ0FBK0M7SUFDL0MsMkVBQTJFO0lBQzNFLE1BQU0sQ0FBQyxVQUFpQztRQUN0QyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzlDLElBQUksQ0FBQyxZQUFZLENBQUMs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QUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM3RSxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsRUFDRixVQUFVLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNuQixNQUFNLFlBQVksR0FBRywyQkFBMkIsQ0FBQztZQUNqRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakQsT0FBTyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDNUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELENBQUM7OzhGQXZIVSx1QkFBdUI7K0RBQXZCLHVCQUF1QixXQUF2Qix1QkFBdUI7a0RBQXZCLHVCQUF1QjtjQURuQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgb2YsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciwgc3dpdGNoTWFwLCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vYXBpL2RhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDaGVja1Nlc3Npb25TZXJ2aWNlIH0gZnJvbSAnLi4vaWZyYW1lL2NoZWNrLXNlc3Npb24uc2VydmljZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVkaXJlY3RTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvcmVkaXJlY3QvcmVkaXJlY3Quc2VydmljZSc7XHJcbmltcG9ydCB7IFVybFNlcnZpY2UgfSBmcm9tICcuLi91dGlscy91cmwvdXJsLnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgTG9nb2ZmUmV2b2NhdGlvblNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBkYXRhU2VydmljZTogRGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHVybFNlcnZpY2U6IFVybFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGNoZWNrU2Vzc2lvblNlcnZpY2U6IENoZWNrU2Vzc2lvblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dzU2VydmljZTogRmxvd3NTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWRpcmVjdFNlcnZpY2U6IFJlZGlyZWN0U2VydmljZVxyXG4gICkge31cclxuXHJcbiAgLy8gTG9ncyBvdXQgb24gdGhlIHNlcnZlciBhbmQgdGhlIGxvY2FsIGNsaWVudC5cclxuICAvLyBJZiB0aGUgc2VydmVyIHN0YXRlIGhhcyBjaGFuZ2VkLCBjaGVja3Nlc3Npb24sIHRoZW4gb25seSBhIGxvY2FsIGxvZ291dC5cclxuICBsb2dvZmYodXJsSGFuZGxlcj86ICh1cmw6IHN0cmluZykgPT4gYW55KSB7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2xvZ29mZiwgcmVtb3ZlIGF1dGggJyk7XHJcbiAgICBjb25zdCBlbmRTZXNzaW9uVXJsID0gdGhpcy5nZXRFbmRTZXNzaW9uVXJsKCk7XHJcbiAgICB0aGlzLmZsb3dzU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcblxyXG4gICAgaWYgKCFlbmRTZXNzaW9uVXJsKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnb25seSBsb2NhbCBsb2dpbiBjbGVhbmVkIHVwLCBubyBlbmRfc2Vzc2lvbl9lbmRwb2ludCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuY2hlY2tTZXNzaW9uU2VydmljZS5zZXJ2ZXJTdGF0ZUNoYW5nZWQoKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ29ubHkgbG9jYWwgbG9naW4gY2xlYW5lZCB1cCwgc2VydmVyIHNlc3Npb24gaGFzIGNoYW5nZWQnKTtcclxuICAgIH0gZWxzZSBpZiAodXJsSGFuZGxlcikge1xyXG4gICAgICB1cmxIYW5kbGVyKGVuZFNlc3Npb25VcmwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZWRpcmVjdFNlcnZpY2UucmVkaXJlY3RUbyhlbmRTZXNzaW9uVXJsKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxvZ29mZkxvY2FsKCkge1xyXG4gICAgdGhpcy5mbG93c1NlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIHJlZnJlc2ggdG9rZW4gYW5kIGFuZCB0aGUgYWNjZXNzIHRva2VuIGFyZSByZXZva2VkIG9uIHRoZSBzZXJ2ZXIuIElmIHRoZSByZWZyZXNoIHRva2VuIGRvZXMgbm90IGV4aXN0XHJcbiAgLy8gb25seSB0aGUgYWNjZXNzIHRva2VuIGlzIHJldm9rZWQuIFRoZW4gdGhlIGxvZ291dCBydW4uXHJcbiAgbG9nb2ZmQW5kUmV2b2tlVG9rZW5zKHVybEhhbmRsZXI/OiAodXJsOiBzdHJpbmcpID0+IGFueSkge1xyXG4gICAgaWYgKCF0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpPy5yZXZvY2F0aW9uRW5kcG9pbnQpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdyZXZvY2F0aW9uIGVuZHBvaW50IG5vdCBzdXBwb3J0ZWQnKTtcclxuICAgICAgdGhpcy5sb2dvZmYodXJsSGFuZGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRSZWZyZXNoVG9rZW4oKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5yZXZva2VSZWZyZXNoVG9rZW4oKS5waXBlKFxyXG4gICAgICAgIHN3aXRjaE1hcCgocmVzdWx0KSA9PiB0aGlzLnJldm9rZUFjY2Vzc1Rva2VuKHJlc3VsdCkpLFxyXG4gICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgcmV2b2tlIHRva2VuIGZhaWxlZGA7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlLCBlcnJvcik7XHJcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHRhcCgoKSA9PiB0aGlzLmxvZ29mZih1cmxIYW5kbGVyKSlcclxuICAgICAgKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnJldm9rZUFjY2Vzc1Rva2VuKCkucGlwZShcclxuICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYHJldm9rZSBhY2Nlc3MgdG9rZW4gZmFpbGVkYDtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UsIGVycm9yKTtcclxuICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgdGFwKCgpID0+IHRoaXMubG9nb2ZmKHVybEhhbmRsZXIpKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcwMDlcclxuICAvLyByZXZva2VzIGFuIGFjY2VzcyB0b2tlbiBvbiB0aGUgU1RTLiBJZiBubyB0b2tlbiBpcyBwcm92aWRlZCwgdGhlbiB0aGUgdG9rZW4gZnJvbVxyXG4gIC8vIHRoZSBzdG9yYWdlIGlzIHJldm9rZWQuIFlvdSBjYW4gcGFzcyBhbnkgdG9rZW4gdG8gcmV2b2tlLiBUaGlzIG1ha2VzIGl0IHBvc3NpYmxlIHRvXHJcbiAgLy8gbWFuYWdlIHlvdXIgb3duIHRva2Vucy4gVGhlIGlzIGEgcHVibGljIEFQSS5cclxuICByZXZva2VBY2Nlc3NUb2tlbihhY2Nlc3NUb2tlbj86IGFueSkge1xyXG4gICAgY29uc3QgYWNjZXNzVG9rID0gYWNjZXNzVG9rZW4gfHwgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKCk7XHJcbiAgICBjb25zdCBib2R5ID0gdGhpcy51cmxTZXJ2aWNlLmNyZWF0ZVJldm9jYXRpb25FbmRwb2ludEJvZHlBY2Nlc3NUb2tlbihhY2Nlc3NUb2spO1xyXG4gICAgY29uc3QgdXJsID0gdGhpcy51cmxTZXJ2aWNlLmdldFJldm9jYXRpb25FbmRwb2ludFVybCgpO1xyXG5cclxuICAgIGxldCBoZWFkZXJzOiBIdHRwSGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpO1xyXG4gICAgaGVhZGVycyA9IGhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZGF0YVNlcnZpY2UucG9zdCh1cmwsIGJvZHksIGhlYWRlcnMpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygncmV2b2NhdGlvbiBlbmRwb2ludCBwb3N0IHJlc3BvbnNlOiAnLCByZXNwb25zZSk7XHJcbiAgICAgICAgcmV0dXJuIG9mKHJlc3BvbnNlKTtcclxuICAgICAgfSksXHJcbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFJldm9jYXRpb24gcmVxdWVzdCBmYWlsZWRgO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MDA5XHJcbiAgLy8gcmV2b2tlcyBhbiByZWZyZXNoIHRva2VuIG9uIHRoZSBTVFMuIFRoaXMgaXMgb25seSByZXF1aXJlZCBpbiB0aGUgY29kZSBmbG93IHdpdGggcmVmcmVzaCB0b2tlbnMuXHJcbiAgLy8gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIHRoZW4gdGhlIHRva2VuIGZyb20gdGhlIHN0b3JhZ2UgaXMgcmV2b2tlZC4gWW91IGNhbiBwYXNzIGFueSB0b2tlbiB0byByZXZva2UuXHJcbiAgLy8gVGhpcyBtYWtlcyBpdCBwb3NzaWJsZSB0byBtYW5hZ2UgeW91ciBvd24gdG9rZW5zLlxyXG4gIHJldm9rZVJlZnJlc2hUb2tlbihyZWZyZXNoVG9rZW4/OiBhbnkpIHtcclxuICAgIGNvbnN0IHJlZnJlc2hUb2sgPSByZWZyZXNoVG9rZW4gfHwgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmdldFJlZnJlc2hUb2tlbigpO1xyXG4gICAgY29uc3QgYm9keSA9IHRoaXMudXJsU2VydmljZS5jcmVhdGVSZXZvY2F0aW9uRW5kcG9pbnRCb2R5UmVmcmVzaFRva2VuKHJlZnJlc2hUb2spO1xyXG4gICAgY29uc3QgdXJsID0gdGhpcy51cmxTZXJ2aWNlLmdldFJldm9jYXRpb25FbmRwb2ludFVybCgpO1xyXG5cclxuICAgIGxldCBoZWFkZXJzOiBIdHRwSGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpO1xyXG4gICAgaGVhZGVycyA9IGhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZGF0YVNlcnZpY2UucG9zdCh1cmwsIGJvZHksIGhlYWRlcnMpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygncmV2b2NhdGlvbiBlbmRwb2ludCBwb3N0IHJlc3BvbnNlOiAnLCByZXNwb25zZSk7XHJcbiAgICAgICAgcmV0dXJuIG9mKHJlc3BvbnNlKTtcclxuICAgICAgfSksXHJcbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFJldm9jYXRpb24gcmVxdWVzdCBmYWlsZWRgO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGdldEVuZFNlc3Npb25VcmwoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICBjb25zdCBpZFRva2VuID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmdldElkVG9rZW4oKTtcclxuICAgIHJldHVybiB0aGlzLnVybFNlcnZpY2UuY3JlYXRlRW5kU2Vzc2lvblVybChpZFRva2VuKTtcclxuICB9XHJcbn1cclxuIl19
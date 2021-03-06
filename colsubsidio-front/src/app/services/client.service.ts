import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { IClient } from '../interfaces/client.interface';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Content, IPage } from '../interfaces/pageable.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  constructor(private _http:HttpClient, private _route:Router, private _auth:AuthService) { }

  getClients(page:number):Observable<IPage>{
    return this._http.get(`${environment.url_base}clients/page/${page}`).pipe(
      map((resp: any) => {
        (resp.content as IClient[]).map((client) => {
          client.fullName = client.fullName.toUpperCase();
          return client;
        });
        return resp;
      })
    );

  }



  findClientById(id:number):Observable<IClient>{
    return this._http.get<IClient>(`${environment.url_base}client/${id}`, {headers: this.authorizationHeaders()}).pipe(
      catchError(e => {
        if(this.isNotAuthorized(e)){
          return throwError(()=>e);
        }

        this._route.navigate(['/clients']);
        console.error(e.error.message);
        Swal.fire('Error al obtener el cliente', e.error.message, 'error');
        return throwError(()=> e);
      })
    );
  }

  registerClient(client:IClient):Observable<IClient>{
    return this._http.post<IClient>(`${environment.url_base}clients`, client, {headers: this.authorizationHeaders()}).pipe(
      catchError(e => {
        if(this.isNotAuthorized(e)){
          return throwError(()=>e);
        }

        if(e.status === 400){
          return throwError(()=>e);
        }

        console.error(e.error.message);
        Swal.fire('Error al registrarse', e.error.message, 'error');
        return throwError(()=> e);
      })
    );
  }

  updateClient(client:IClient|any):Observable<IClient|any>{
      return this._http.put<Observable<IClient>>(`${environment.url_base}client/${client.id}`,client , {headers: this.authorizationHeaders()}).pipe(
      catchError(e => {
        if(this.isNotAuthorized(e)){
          return throwError(()=>e);
        }

        if(e.status === 400){
          return throwError(()=>e);
        }

        this._route.navigate(['/clients']);
        console.error(e.error.message);
        Swal.fire('Error al actualizar los datos', e.error.message, 'error');
        return throwError(()=> e);
      })
    );
  }

  deleteClient(id:number|any):Observable<IClient|any>{
    return this._http.delete<Observable<IClient>>(`${environment.url_base}client/${id}`, {headers: this.authorizationHeaders()}).pipe(
      catchError(e => {
        if(this.isNotAuthorized(e)){
          return throwError(()=>e);
        }
        console.error(e.error.message);
        Swal.fire('Error al eliminar', e.error.message, 'error');
        return throwError(()=> e);
      })
    );
  }


  uploadsPhoto(file:File, id:any):Observable<HttpEvent<{}>>{
    let formData = new FormData();
    formData.append("archivo",file);
    formData.append("id", id);
    let httpHeaders = new HttpHeaders();
    let token = this._auth.getToken;
    if (token !=null){
      httpHeaders.append('Authorization', 'Bearer '+token);
    }
    const req = new HttpRequest('POST', `${environment.url_base}/uploads`, formData, {
      reportProgress: true,
      headers:httpHeaders
    });


    return this._http.request(req).pipe(
      catchError(e => {
        this.isNotAuthorized(e);
        return throwError(()=> e);
      })
    )
  }

  private _getHeaders(): HttpHeaders {
      return new HttpHeaders({'Content-Type' : environment.headers});
  }

  private isNotAuthorized(error:any):boolean{
    if(error.status === 401 || error.status === 403){
      this._route.navigate(['/login']);
      return true;
    }
    return false;
  }

  private authorizationHeaders():HttpHeaders{
    let token = this._auth.getToken;
    if (token !=null){
      return this._getHeaders().append('Authorization', 'Bearer ' + token) 
    }
    return this._getHeaders();
  }




   /* .pipe(
    tap((resp:any) =>{
      (resp.content as IClient[]).forEach((cliente)=>{
        console.log(cliente);
      });        
    }),
    map((resp:any) => {
      (resp.content as IClient[]).map(cliente=>{
        cliente.fullName = cliente.fullName.toUpperCase();
        return cliente;
      });
      return resp;
    }),
    tap((resp:any)=>{
      (resp.content as IClient[]).forEach(cliente =>{
        console.log(cliente.fullName);
      })
    })
   );*/
}

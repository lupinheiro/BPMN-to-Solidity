import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import * as Viewer from 'bpmn-js/lib/Viewer';


import { Observable } from 'rxjs/Observable';
import { element } from 'protractor';
import { ProcessStorage } from '../Dados/dados';


declare function require(name: string);
const jQuery = require('jquery');
const input_params_as_form = require('ejs-compiled-loader!./input-params-as-form.ejs');
const href_list_as_dropdown_menu = require('ejs-compiled-loader!./href-list-as-dropdown-menu.ejs');

@Component({
  selector: 'viewer',
  styleUrls: ['./viewer.component.css'],
  templateUrl: "./viewer.component.html"
})
export class ViewerComponent implements OnInit {
  activeContracts = ['No Contracts Available'];
  url = 'No Contracts Available';
  viewer: any;
  canvas: any;
  previousState: any = null;
  selectedAddress = '';
  pCases = [];

  connection;
  message;

  //Verifica os processos disponiveis, no dropdown do viewer

  constructor(private router: Router, private http: Http, private processStorage: ProcessStorage) {
     const instances = processStorage.getInstance(processStorage.modelId);
     this.activeContracts = [];
     instances.forEach(element => {
       this.activeContracts.push('http://localhost:3000/processes/' + element);
     });
     if (this.activeContracts.length === 0) {
       this.activeContracts.push('No Contracts Available');
       this.url = 'No Contracts Available';
     } else {
       this.url = 'http://localhost:3000/processes/' + processStorage.actInst;
     }
  }

  //carrega os modelos criados

  loadModel() {
    if (this.url !== 'No Contracts Available' && this.url !== '') {
      this.http.get(this.url)
        .subscribe(resp =>
          this.viewer.importXML(resp.json().bpmn, (definitions) => {
            this.renderState(resp.json());
          })
        );
    }
  }

  goToDashborad() {
      this.router.navigateByUrl('/dashboard');
  }

  //update dos contratos

  updateContracts() {
    this.processStorage.updateInstances(this.processStorage.modelId);
    const res = this.processStorage.getInstance(this.processStorage.modelId);
    this.activeContracts = ['No Contracts Available'];
    res.forEach(element => {
        this.url = 'http://localhost:3000/processes/' + element;
        this.activeContracts.push(this.url);
    });
    if (this.activeContracts.length > 1 && this.activeContracts[0] === 'No Contracts Available') {
      this.activeContracts.splice(0, 1);
    }
  }

  //atualiza o estado do presente passo, muda a cor do passo a ser executado.
  renderState(state: any) {
    if (this.previousState) {
      this.previousState.workitems.forEach(workItem => {
        try {
          this.canvas.removeMarker(workItem.elementId, 'highlight');
          this.canvas.removeMarker(workItem.elementId, 'highlight-running');
        } catch(Error) {}
      });
    }
    this.previousState = [];
    state.workitems.forEach(workItem => {
      try { this.canvas.addMarker(workItem.elementId, 'highlight'); }
      catch(Error) {}
    });
    this.previousState = state;
  }

  //seleciona o passo a ser executado e recebe os dados.

  setupListeners() {
    const eventBus = this.viewer.get('eventBus');
    const overlays = this.viewer.get('overlays');
    eventBus.on('element.click', (e: any) => {
      let nodeId = e.element.id;
      let workItem = undefined;
      if (this.previousState) {
        this.previousState.workitems.forEach(workItem1 => {
          if (workItem1.elementId === e.element.id) {
            workItem = workItem1;
            nodeId = e.element.id;
          }
        });
      }
      if (workItem) {
            this.canvas.removeMarker(workItem.elementId, 'highlight');
            this.canvas.addMarker(workItem.elementId, 'highlight-running');
            let inputParam = []
            if (workItem.input.length > 0)
              inputParam = workItem.input;
            this.pCases = workItem.pCases;
            const overlayHtml = jQuery(input_params_as_form({ nodeId: workItem.elementId, inputs: workItem.input, pCases: workItem.pCases, href: workItem.hrefs }));

            overlays.add(workItem.elementId, { position: { bottom: 0, right: 0 }, html: overlayHtml });
            overlayHtml
                .find(`#${workItem.elementId}_save`)
                .click((e: any) => {
                  const nodeId1 = e.target.id.slice(0, e.target.id.indexOf('_save'));
                  overlays.remove({ element: nodeId1 });

                  const children = e.target.parentElement.querySelectorAll('.form-control');
                  const tabs = e.target.parentElement.querySelectorAll('.active');

                  // Encontra a Operação a Executar
                  let operation = 0;
                  let values: Array<any> = [];
                  tabs.forEach((child: any) => {
                    if (child.id === 'home') {
                      console.log('EXECUTION OPERATION ');
                      operation = 0;
                      workItem.input.forEach((input: any) => {
                        children.forEach((child: any) => {
                          if (child.id === input.name) {
                            values.push(input.type === 'bool' ? child.checked : child.value);
                          }
                        });
                      });
                    }
                  });


                  let workItemIndex = 0;

                  // Encontra o User que executa a Ação
                  let user_address = '';
                  let caseAddress = 0;

                  children.forEach((child: any) => {
                    if(child.id === 'pCase') {
                      workItemIndex = child.value;
                    }
                    if (child.id === 'user_address') {
                      user_address = child.value;
                    }
                  });
                  this.http.post('http://localhost:3000' + workItem.hrefs[workItemIndex], { elementId: workItem.elementId, inputParameters: values, user: user_address})
                    .subscribe(resp => this.http.get(this.url).subscribe(resp1 => this.renderState(resp1.json())));
                });
              overlayHtml.find(`#${workItem.elementId}_cancel`).click((e1: any) => {
                overlays.remove({ element: workItem.elementId });
              });
      }
  
    });
  }

  ngOnInit(): void {
    this.viewer = new Viewer({ container: '#canvas' });
    this.canvas = this.viewer.get('canvas');
    this.updateContracts();
    this.setupListeners();

  }

}

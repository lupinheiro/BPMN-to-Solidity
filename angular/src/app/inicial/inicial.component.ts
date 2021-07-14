import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { element } from 'protractor';
import { ProcessStorage } from '../Dados/dados';
import * as Viewer from 'bpmn-js/lib/Viewer';

declare function require(name: string);

const jQuery = require('jquery');
const Prism = require('prismjs');

@Component({
  selector: 'dashboard',
  templateUrl: './inicial.component.html'
})
//instancia para receber os dados dos inputs.

export class DashboardComponent {
  toSearch = '';
  rootProcess = '';
  policyId = '';
  registryAddress = '';

  bindingPolicy = '';

  nominatorRole = '';
  nomineeRole = '';
  procesCase = '';

  nominatorNAddress = '';
  nomineeNAddress = '';

  endorserRole = '';
  endorserAddress = '';

  nominatorRAddress = '';
  onNomination = "true";
  isAccepted = "true";

  roleState = 'UNDEFINED';
  pCaseQuery = '';
  roleToQuery = '';
  caseCreator = '';
  caseCreatorRole = '';


  constructor(private router: Router, public processStorage: ProcessStorage) {
    this.searchElement();
  }

//estado do Binding à tarefa.
  findRoleState() {
    let errorM = '';
    errorM = this.checkEmpty(this.pCaseQuery, '[Role] ');
    if(errorM !== '') {
      alert('Error: ' + errorM + 'cannot be empty');
      errorM = '';
    } else {
       this.processStorage.findRoleState(this.roleToQuery, this.pCaseQuery);
       this.roleState = this.processStorage.roleState;
    }
  }

  //verifica se existe input.
  checkEmpty(input, text) {
    return input == '' ? text : ''; 
  }

  //Cria nova Instancia.
  createInstance(pId) {
    let errorM = this.checkEmpty(this.caseCreator, '[Case Creator Address] ');
    if(errorM !== '') {
      alert('Error: ' + errorM + 'cannot be empty');
      errorM = '';
    } else {
      this.processStorage.createInstance(pId, this.caseCreator, this.caseCreatorRole);
    }
  }

  //Nomear determinado User a uma Tarefa do Processo.
  nominate() {
    let errorM = '';
    errorM = this.checkEmpty(this.nominatorRole, '[Nominator Role] ') + 
             this.checkEmpty(this.nomineeRole, '[Nominee Role] ') +
             this.checkEmpty(this.procesCase, '[Process Case] ') +
             this.checkEmpty(this.nominatorNAddress, '[Nominator Address] ') +
             this.checkEmpty(this.nomineeNAddress, '[Nominee Address] ');
    if(errorM !== '') {
      alert('Error: ' + errorM + 'cannot be empty');
      errorM = '';
    } else {
      console.log(this.nominatorRole);
      this.processStorage.nominate(this.nominatorRole, this.nomineeRole, this.nominatorNAddress, this.nomineeNAddress, this.procesCase);
    }
  }

//liberta um user da sua Funcao.
  release() {
    let errorM = '';
    errorM = this.checkEmpty(this.nominatorRole, '[Nominator Role] ') + 
             this.checkEmpty(this.nomineeRole, '[Nominee Role] ') +
             this.checkEmpty(this.procesCase, '[Process Case] ') +
             this.checkEmpty(this.nominatorRAddress, '[Nominator Address] ');

    if(errorM !== '') {
      alert('Error: ' + errorM + 'cannot be empty');
      errorM = '';
    } else {
      this.processStorage.release(this.nominatorRole, this.nomineeRole, this.nominatorRAddress, this.procesCase);
    }
  }

  //Nao cheguei a implementar os votos. Work in Progress.
  vote() {
    let errorM = '';
    errorM = this.checkEmpty(this.nominatorRole, '[Nominator Role] ') + 
             this.checkEmpty(this.nomineeRole, '[Nominee Role] ') +
             this.checkEmpty(this.procesCase, '[Process Case] ') +
             this.checkEmpty(this.endorserRole, '[Endorser Role] ') +
             this.checkEmpty(this.endorserAddress, '[Endorser Address] ');

    if(errorM !== '') {
      alert('Error: ' + errorM + 'cannot be empty');
      errorM = '';
    } else {
      this.processStorage.vote(this.nominatorRole, this.nomineeRole, this.endorserRole, this.endorserAddress, this.procesCase, this.onNomination === "true", this.isAccepted === "true");
    }    
  }

  //abre o ficheiro da Binding Policy.
  openFile(event) {
    const input = event.target;
    var myFile = event.target.files[0];
    var reader = new FileReader();
    reader.readAsText(myFile);
    reader.onload = () => {
      this.bindingPolicy = reader.result.toString();
      
    };
  }

  //instancia a criacao de um novo diagrama bpmn.
  drawModel(proc: any) {
    let viewer = new Viewer({ container: '#proc.id' + '_canvas' });
    let canvas = viewer.get('#proc.id' + '_canvas');
    viewer.importXML(proc.bpmn, (definitions) => { })
  }

  sendResourceModel() {
      this.processStorage.resourceModel = this.bindingPolicy;
      this.processStorage.sendResourceModel();
  }

  createProcessRegistry() {
     this.processStorage.createProcessRegistry();
  }

  loadProcessRegistry() {
    this.processStorage.loadProcessRegistry(this.registryAddress);
  }

  openModeler() {
    this.router.navigateByUrl('/modeler');
  }
  openViewer(procName, instance) {
    this.processStorage.modelId = procName;
    this.processStorage.actInst = instance;
    this.router.navigateByUrl('/viewer');
  }

  searchElement() {
    this.processStorage.searchRegisteredModel(this.toSearch);
  }

  createTaskRole() {
    this.processStorage.createTaskRole(this.rootProcess, this.policyId);
  }

  updateInstances(proc) {
    this.processStorage.updateInstances(proc);
  }

  getSolidity(proc) {
    return Prism.highlight(proc.solidity, Prism.languages.javascript);
  }
}

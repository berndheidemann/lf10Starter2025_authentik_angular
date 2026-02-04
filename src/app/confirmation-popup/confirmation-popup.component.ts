import {Component, effect, ElementRef, input, ViewChild, viewChild} from '@angular/core';

@Component({
  selector: 'app-confirmation-popup',
  imports: [],
  templateUrl: './confirmation-popup.component.html',
  styleUrl: './confirmation-popup.component.css',
})
export class ConfirmationPopupComponent {

  popUpText = "";
  dialog = viewChild.required<ElementRef>('confirmationDialoge')
  private confirmCallback?: () => void;

  showMessage(message: string,onConfirm?: () => void) {
    this.popUpText = message;
    this.confirmCallback = onConfirm;
    this.dialog().nativeElement.showModal();
  }

  confirmAction() {
    this.confirmCallback?.();
    this.dialog().nativeElement.close();
  }

}

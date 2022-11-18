import { Directive, HostListener } from '@angular/core';

const IONSELECT_DISPLAY_DELAY_MS = 250;   /* In milliseconds */

/** Directive to force selected item in ionSelect component to be scrolled into view
 * Provides a workaround for issue #19296 (https://github.com/ionic-team/ionic-framework/issues/19296)
 */
@Directive({
  // tslint:disable-next-line: directive-selector
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ion-select'
})
export class IonselectAutoscrollDirective {
  @HostListener('click') public onClick(): void {
    /* HACK ALERT!  Previous versions of Ionic allowed you to subscribe to events on the popover overlay via:
        selectControl._overlay.didEnter.subscribe(() => {...}
      You could then use setTimeout() without a delay to allow just one cycle before scrolling the list.  This
      is no longer available, so we're going to have to use a short delay and hope that that's enough time
      for the list to be instantiated.

      This is also working on the assumption that only one set of options can be displayed at a time since we
      have to search for elements on the document because they're not children of (or linked by id/attribute to)
      the ion-select element.
    */
    setTimeout(() => {
      /* Unfortunately, the different ionSelect interfaces decorate their items with different classes and use
        different ways to identify the selected item:
          * alert - uses the `select-interface-option` class on the button and the `aria-checked` attribute to
            mark the selected item
          * action-sheet - also uses the `select-interface-option` class on the button but uses the
            `action-sheet-selected` class to mark the selected item
          * popover - uses the `sc-ion-select-popover` class on the `ion-radio` element and the `aria-checked`
            attribute to mark the selected item
        So it's simpler to look for the different classes to identify each interface instead.
      */
      let selectedOption: Element | null = null;
      let options: HTMLCollectionOf<Element> = document.getElementsByClassName('action-sheet-button');
      if (options.length > 0) {
        for (const option of options as any) {
          if (option.classList.contains('action-sheet-selected')) {
            selectedOption = option;
            break;
          }
        }
      } else {
        options = document.getElementsByClassName('alert-radio-button');
        if (options.length === 0) {
          options = document.getElementsByClassName('sc-ion-select-popover');
        }

        for (const option of options as any) {
          const attribute: Attr | null = option.attributes.getNamedItem('aria-checked');
          if (attribute && attribute.value === 'true') {
            selectedOption = option;
            break;
          }
        }
      }

      if (selectedOption) {
        selectedOption.scrollIntoView({ block: 'center' });
      }
    }, IONSELECT_DISPLAY_DELAY_MS);
  }
}

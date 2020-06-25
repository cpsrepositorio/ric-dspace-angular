// Load the implementations that should be tested
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick, } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DynamicFormLayoutService, DynamicFormsCoreModule, DynamicFormValidationService } from '@ng-dynamic-forms/core';
import { DynamicFormsNGBootstrapUIModule } from '@ng-dynamic-forms/ui-ng-bootstrap';

import { VocabularyOptions } from '../../../../../../core/submission/vocabularies/models/vocabulary-options.model';
import { VocabularyService } from '../../../../../../core/submission/vocabularies/vocabulary.service';
import { VocabularyServiceStub } from '../../../../../testing/vocabulary-service.stub';
import { DsDynamicScrollableDropdownComponent } from './dynamic-scrollable-dropdown.component';
import { DynamicScrollableDropdownModel } from './dynamic-scrollable-dropdown.model';
import { VocabularyEntry } from '../../../../../../core/submission/vocabularies/models/vocabulary-entry.model';
import { createTestComponent, hasClass } from '../../../../../testing/utils.test';

export const SD_TEST_GROUP = new FormGroup({
  dropdown: new FormControl(),
});

export const SD_TEST_MODEL_CONFIG = {
  vocabularyOptions: {
    closed: false,
    metadata: 'dropdown',
    name: 'common_iso_languages',
    scope: 'c1c16450-d56f-41bc-bb81-27f1d1eb5c23'
  } as VocabularyOptions,
  disabled: false,
  errorMessages: { required: 'Required field.' },
  id: 'dropdown',
  label: 'Language',
  maxOptions: 10,
  name: 'dropdown',
  placeholder: 'Language',
  readOnly: false,
  required: false,
  repeatable: false,
  value: undefined,
  metadataFields: [],
  submissionId: '1234'
};

describe('Dynamic Dynamic Scrollable Dropdown component', () => {

  let testComp: TestComponent;
  let scrollableDropdownComp: DsDynamicScrollableDropdownComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let scrollableDropdownFixture: ComponentFixture<DsDynamicScrollableDropdownComponent>;
  let html;
  let modelValue;

  const vocabularyServiceStub = new VocabularyServiceStub();

  // async beforeEach
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        DynamicFormsCoreModule,
        DynamicFormsNGBootstrapUIModule,
        FormsModule,
        InfiniteScrollModule,
        ReactiveFormsModule,
        NgbModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        DsDynamicScrollableDropdownComponent,
        TestComponent,
      ], // declare the test component
      providers: [
        ChangeDetectorRef,
        DsDynamicScrollableDropdownComponent,
        { provide: VocabularyService, useValue: vocabularyServiceStub },
        { provide: DynamicFormLayoutService, useValue: {} },
        { provide: DynamicFormValidationService, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

  }));

  describe('', () => {
    // synchronous beforeEach
    beforeEach(() => {
      html = `
      <ds-dynamic-scrollable-dropdown [bindId]="bindId"
                                      [group]="group"
                                      [model]="model"
                                      (blur)="onBlur($event)"
                                      (change)="onValueChange($event)"
                                      (focus)="onFocus($event)"></ds-dynamic-scrollable-dropdown>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    it('should create DsDynamicScrollableDropdownComponent', inject([DsDynamicScrollableDropdownComponent], (app: DsDynamicScrollableDropdownComponent) => {

      expect(app).toBeDefined();
    }));
  });

  describe('', () => {
    describe('when init model value is empty', () => {
      beforeEach(() => {

        scrollableDropdownFixture = TestBed.createComponent(DsDynamicScrollableDropdownComponent);
        scrollableDropdownComp = scrollableDropdownFixture.componentInstance; // FormComponent test instance
        scrollableDropdownComp.group = SD_TEST_GROUP;
        scrollableDropdownComp.model = new DynamicScrollableDropdownModel(SD_TEST_MODEL_CONFIG);
        scrollableDropdownFixture.detectChanges();
      });

      afterEach(() => {
        scrollableDropdownFixture.destroy();
        scrollableDropdownComp = null;
      });

      it('should init component properly', () => {
        expect(scrollableDropdownComp.optionsList).toBeDefined();
        expect(scrollableDropdownComp.optionsList).toEqual(vocabularyServiceStub.getList());
      });

      it('should display dropdown menu entries', () => {
        const de = scrollableDropdownFixture.debugElement.query(By.css('button.ds-form-input-btn'));
        const btnEl = de.nativeElement;

        const deMenu = scrollableDropdownFixture.debugElement.query(By.css('div.scrollable-dropdown-menu'));
        const menuEl = deMenu.nativeElement;

        btnEl.click();
        scrollableDropdownFixture.detectChanges();

        expect(hasClass(menuEl, 'show')).toBeTruthy();
      });

      it('should fetch the next set of results when the user scroll to the end of the list', fakeAsync(() => {
        scrollableDropdownComp.pageInfo.currentPage = 1;
        scrollableDropdownComp.pageInfo.totalPages = 2;

        scrollableDropdownFixture.detectChanges();

        scrollableDropdownComp.onScroll();
        tick();

        expect(scrollableDropdownComp.optionsList.length).toBe(4);
      }));

      it('should select a results entry properly', fakeAsync(() => {
        const selectedValue = Object.assign(new VocabularyEntry(), { authority: 1, display: 'one', value: 1 });

        let de: any = scrollableDropdownFixture.debugElement.query(By.css('button.ds-form-input-btn'));
        let btnEl = de.nativeElement;

        btnEl.click();
        scrollableDropdownFixture.detectChanges();

        de = scrollableDropdownFixture.debugElement.queryAll(By.css('button.dropdown-item'));
        btnEl = de[0].nativeElement;

        btnEl.click();

        scrollableDropdownFixture.detectChanges();

        expect((scrollableDropdownComp.model as any).value).toEqual(selectedValue);
      }));

      it('should emit blur Event onBlur', () => {
        spyOn(scrollableDropdownComp.blur, 'emit');
        scrollableDropdownComp.onBlur(new Event('blur'));
        expect(scrollableDropdownComp.blur.emit).toHaveBeenCalled();
      });

      it('should emit focus Event onFocus', () => {
        spyOn(scrollableDropdownComp.focus, 'emit');
        scrollableDropdownComp.onFocus(new Event('focus'));
        expect(scrollableDropdownComp.focus.emit).toHaveBeenCalled();
      });

    });

    describe('when init model value is not empty', () => {
      beforeEach(() => {

        scrollableDropdownFixture = TestBed.createComponent(DsDynamicScrollableDropdownComponent);
        scrollableDropdownComp = scrollableDropdownFixture.componentInstance; // FormComponent test instance
        scrollableDropdownComp.group = SD_TEST_GROUP;
        modelValue = Object.assign(new VocabularyEntry(), { authority: 1, display: 'one', value: 1 });
        scrollableDropdownComp.model = new DynamicScrollableDropdownModel(SD_TEST_MODEL_CONFIG);
        scrollableDropdownComp.model.value = modelValue;
        scrollableDropdownFixture.detectChanges();
      });

      afterEach(() => {
        scrollableDropdownFixture.destroy();
        scrollableDropdownComp = null;
      });

      it('should init component properly', () => {
        expect(scrollableDropdownComp.optionsList).toBeDefined();
        expect(scrollableDropdownComp.optionsList).toEqual(vocabularyServiceStub.getList());
        expect(scrollableDropdownComp.model.value).toEqual(modelValue);
      });
    });
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {

  group: FormGroup = SD_TEST_GROUP;

  model = new DynamicScrollableDropdownModel(SD_TEST_MODEL_CONFIG);

  showErrorMessages = false;

}

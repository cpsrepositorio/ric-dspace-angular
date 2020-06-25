import { isEmpty, isNotEmpty, isNotNull } from '../../../empty.util';
import { ConfidenceType } from '../../../../core/shared/confidence-type';
import { PLACEHOLDER_PARENT_METADATA } from '../ds-dynamic-form-ui/models/relation-group/dynamic-relation-group.model';
import { MetadataValueInterface } from '../../../../core/shared/metadata.models';

export interface OtherInformation {
  [name: string]: string
}

/**
 * A class representing a specific input-form field's value
 */
export class FormFieldMetadataValueObject implements MetadataValueInterface {
  value: any;
  display: string;
  language: any;
  authority: string;
  confidence: ConfidenceType;
  place: number;
  label: string;
  otherInformation: OtherInformation;

  constructor(value: any = null,
              language: any = null,
              authority: string = null,
              display: string = null,
              place: number = 0,
              confidence: number = null,
              otherInformation: any = null,
              metadata: string = null) {
    this.value = isNotNull(value) ? ((typeof value === 'string') ? value.trim() : value) : null;
    this.language = language;
    this.authority = authority;
    this.display = display || value;

    this.confidence = confidence;
    if (authority != null && isEmpty(confidence)) {
      this.confidence = ConfidenceType.CF_ACCEPTED;
    } else if (isNotEmpty(confidence)) {
      this.confidence = confidence;
    } else {
      this.confidence = ConfidenceType.CF_UNSET;
    }

    this.place = place;

    this.otherInformation = otherInformation;
  }

  hasAuthority(): boolean {
    return isNotEmpty(this.authority);
  }

  hasValue(): boolean {
    return isNotEmpty(this.value);
  }

  hasOtherInformation(): boolean {
    return isNotEmpty(this.otherInformation);
  }

  hasPlaceholder() {
    return this.hasValue() && this.value === PLACEHOLDER_PARENT_METADATA;
  }
}

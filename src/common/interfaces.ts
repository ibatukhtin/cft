export interface FormField {
  id: string;
  type?: "label" | "text" | "button";
  control: "FORM" | "TEXT" | "BUTTON" | "LABEL";
  caption: string;
  parentID: string;
  tabIndex: number;
  position: number;
  required?: boolean;
  value?: string;
}

export interface FormsData {
  title: string;
  controls: FormField[];
  submitUrl: string;
}

import Vue from 'vue';
import { FormsData } from "@/common/interfaces";

export const store = Vue.observable({
  forms: <FormsData> {},
  submissionStatus: {} as Record<string, { success?: boolean; error?: string }>,
  isSubmitting: {} as Record<string, boolean>,
})

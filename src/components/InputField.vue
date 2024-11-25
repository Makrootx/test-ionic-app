<script setup lang="ts">
import { IonButton, IonIcon, IonInput } from "@ionic/vue";
import { trashBin } from "ionicons/icons";
const model = defineModel<string>();

function clearField(): void {
  model.value = "";
}
</script>

<template>
  <div class="field">
    <div class="var-flex">
      <div class="label"><slot></slot></div>

      <div class="hor-flex field-box">
        <IonInput
          size="small"
          type="text"
          class="input-field"
          v-model="model"
        />
        <div class="var-flex-icon">
          <IonButton class="clear-but" @click="clearField">
            <IonIcon class="trash-icon" slot="icon-only" :icon="trashBin" />
          </IonButton>
        </div>
      </div>
    </div>
  </div>
  <!-- <div>
    <div class="label">{{ text }}</div>
  </div> -->
</template>

<style lang="css" scoped>
.field {
  margin-top: 0px;
  display: flex;
  margin-bottom: 8px;
  align-items: center;
}

.clear-but {
  max-width: 2px;
  max-height: 4px;
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  --font-size: 3px;
  --background: var(--ion-color-danger);
}

.field-box {
  border-radius: 10px;
  background: var(--ion-color-light-shade);
}

.input-field {
  margin-left: 10px;
  margin-right: 10px;
}

.input-field:focus {
  border-color: #777;
  outline: none;
}

.error-input {
  border-color: red;
}

.error-input:focus {
  border-color: red;
}

.label {
  margin-right: 6px;
  min-width: 60px;
  margin-bottom: 10px;
  font-size: large;
}

.trash-icon {
  /* padding: 1px; */
  /* width: 10px;
  height: 10px; */
  flex-grow: 1;
  cursor: pointer;
}

.var-flex {
  flex-direction: column;
  display: flex;
  flex-grow: 1;
}

.var-flex-icon {
  flex-direction: column;
  display: flex;
  flex-grow: 0;
  /* height: 1px; */
}

.hor-flex {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

.err-hint {
  font-size: 0.6em;
  color: #cb7979;
  min-height: 2em;
}
</style>

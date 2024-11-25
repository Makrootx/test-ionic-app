<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle> Modify a car</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent :fullscreen="true">
      <IonHeader collapse="condense">
        <IonToolbar> <IonTitle> Modify a car </IonTitle> </IonToolbar>
      </IonHeader>
      <div style="padding: 1em">
        <div class="img-add-container" @click="filePickClick">
          <IonIcon class="add-icon" v-if="!imagePreview" :icon="add"></IonIcon>
          <img v-if="imagePreview" :src="imagePreview" />
        </div>
        <InputField v-model="car.header">Header</InputField>
        <div style="font-size: large; margin-bottom: 10px">Content</div>
        <IonItem class="content-box">
          <IonTextarea class="content-text" v-model="car.content"></IonTextarea>
        </IonItem>
        <div class="hor-flex">
          <IonButton @click="onSaveClick">Save</IonButton>
          <IonButton
            @click="onCancelClick"
            style="--background: var(--ion-color-warning-shade)"
            >Cancel</IonButton
          >
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script lang="ts" setup>
import InputField from "@/components/InputField.vue";
import { Car } from "@/models/Car";
import { CarService } from "@/providers/cars-service";
import { DbService } from "@/providers/database-service";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  onIonViewDidEnter,
} from "@ionic/vue";
import { add } from "ionicons/icons";
import { inject, Ref, ref } from "vue";
import { useRouter } from "vue-router";

const expCar: Car = { content: "", header: "", id: -1 };
const car = ref<Car>(expCar);
const imagePreview = ref<string | undefined>();
const props = defineProps<{ id: string }>();

const router = useRouter();

const fileName = ref("");
const oldFilePath = ref("");
const dbService: Ref<DbService> | undefined = inject("dbService");

const filePickClick = async () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.click();

  fileInput.onchange = async (event: any) => {
    const file = event.target.files[0];

    if (file) {
      fileName.value = file.name;
      const reader = new FileReader();
      reader.onload = async () => {
        const data = reader.result as string;
        imagePreview.value = data;
      };
      reader.readAsDataURL(file);
    }
  };
};

const saveImage = async () => {
  if (!imagePreview.value) return;
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await Filesystem.writeFile({
        path: fileName.value,
        data: imagePreview.value!.split(",")[1],
        directory: Directory.Documents,
      });
      const filePath = result.uri;
      car.value.filePath = filePath;
      console.log("File saved:", result.uri);
    } catch (e) {
      console.error("Error saving file:", e);
    }
  } else {
    try {
      const base64Data = imagePreview.value.split(",")[1];
      localStorage.setItem(fileName.value, base64Data);
      const filePath = fileName.value;
      car.value.filePath = filePath;
      console.log("File saved at (web): ", fileName.value);
    } catch (error) {
      console.error("Error saving file (web):", error);
    }
  }
};

const deleteFile = async (filePath: string) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.deleteFile({
        path: filePath,
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    localStorage.removeItem(filePath);
  }
};

const onSaveClick = async () => {
  if (imagePreview.value) {
    if (fileName.value !== "") {
      await deleteFile(oldFilePath.value);
      await saveImage();
    }
  }
  if (dbService) {
    const carService = new CarService(dbService.value);
    carService.updateCarById(car.value);
    const id = car.value.id;
    router.push({ name: "CarDetailsView", params: { id } });
  }
};

const onCancelClick = () => {
  router.push({ name: "CarDetailsView", params: { id: car.value.id } });
};

const getImage = (filePath: string) => {
  if (Capacitor.isNativePlatform()) {
    return Filesystem.readFile({
      path: filePath,
    }).then((result) => {
      console.log(result.data.toString());
      return `data:image/png;base64,` + result.data.toString();
    });
  } else {
    const file = localStorage.getItem(filePath);
    return `data:image/png;base64,${file}`;
  }
};

onIonViewDidEnter(async () => {
  if (dbService) {
    const carService = new CarService(dbService.value);
    const res = await carService.getCarById(Number.parseInt(props.id));
    car.value = res ?? expCar;
    if (car.value.filePath) {
      imagePreview.value = await getImage(car.value.filePath);
      oldFilePath.value = car.value.filePath;
    }
  }
});
</script>

<style scoped>
.hor-flex {
  display: flex;
  justify-content: space-between;
}
.content-box {
  border-radius: 10px;
  margin-bottom: 20px;
}
.content-text {
  overflow-y: hidden;
  display: flex;
  min-height: 200px;
  padding: 5px 0px;
}
.img-add-container {
  background-color: #222;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  min-height: 200px;
}

.img-add-container:active {
  background-color: #333;
  transform: scale(0.98);
}
.add-icon {
  size: 20px;
  min-height: 30px;
  min-width: 30px;
  color: #ccc;
}
</style>

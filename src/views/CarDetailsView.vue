<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <IonTitle> {{ car?.header }} </IonTitle>
          <IonButton
            style="
              margin-right: 1em;
              --background: var(--ion-color-danger);
              padding: 1px;
            "
            @click="onDeleteClick"
          >
            <IonIcon slot="icon-only" :icon="trashBin" />
          </IonButton>
        </div>
      </IonToolbar>
    </IonHeader>
    <IonContent :fullscreen="true">
      <IonHeader collapse="condense">
        <IonToolbar>
          <IonTitle> {{ car?.header }} </IonTitle>
        </IonToolbar>
      </IonHeader>
      <div style="padding: 1em">
        <div class="img-container">
          <img :src="imagePreview ?? 'favicon.png'" />
        </div>
        <div class="car-header">
          {{ car?.header }}
        </div>
        <div class="car-content">{{ car?.content }}</div>
      </div>
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton @click="onModifyClick"
          ><IonIcon :icon="construct"
        /></IonFabButton>
      </IonFab>
    </IonContent>
  </IonPage>
</template>

<script lang="ts" setup>
import { Car } from "@/models/Car";
import { CarService } from "@/providers/cars-service";
import { DbService } from "@/providers/database-service";
import { Capacitor } from "@capacitor/core";
import { Filesystem } from "@capacitor/filesystem";
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  onIonViewDidEnter,
  IonFab,
  IonFabButton,
  IonButton,
} from "@ionic/vue";
import { trashBin, construct } from "ionicons/icons";
import { inject, Ref, ref } from "vue";
import { useRouter } from "vue-router";

const car = ref<Car | undefined>();
const dbService: Ref<DbService> | undefined = inject(`dbService`);
const imagePreview = ref<string>();

const props = defineProps<{ id: string }>();
const router = useRouter();

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
    car.value = await carService.getCarById(Number.parseInt(props.id));
    imagePreview.value = car.value?.filePath
      ? await getImage(car.value?.filePath)
      : "favicon.png";
  }
});

const deleteFile = async (filePath: string) => {
  if (dbService?.value) {
    const carService = new CarService(dbService?.value);
    if (await carService.checkFileUsage(filePath)) return;
  }
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

const onDeleteClick = async () => {
  if (dbService) {
    const carService = new CarService(dbService.value);
    if (car.value) {
      car.value.filePath ? await deleteFile(car.value?.filePath) : "";
      await carService.deleteCarById(car.value?.id);
    }
    router.push({ path: "/tabs" });
  }
};

const onModifyClick = async () => {
  if (car.value) {
    const id = car.value.id;
    router.push({ name: "ModifyCarView", params: { id } });
  }
};
</script>

<style scoped>
.img-container {
  background-color: #222;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.car-header {
  font-size: xx-large;
  color: #aaa;
  margin-bottom: 20px;
}

.car-content {
  font-size: medium;
}
</style>

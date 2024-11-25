<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Car List</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Car List</ion-title>
        </ion-toolbar>
      </ion-header>
      <div v-if="cars.length > 0">
        <div class="card-container">
          <CardComponent
            v-for="(item, index) in cars"
            :key="item.id"
            :header="item.header"
            :img="loadImages ? loadImages[index] ?? undefined : undefined"
            @click="onClick(item.id)"
            >{{ item.content }}</CardComponent
          >
        </div>
      </div>
      <div
        v-if="cars.length <= 0"
        style="
          text-align: center;
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: xx-large;
        "
      >
        Add new cars
      </div>
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton @click="onAddClick"><IonIcon :icon="add" /></IonFabButton>
      </IonFab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  onIonViewDidEnter,
} from "@ionic/vue";
import CardComponent from "@/components/CardComponent.vue";
import { add } from "ionicons/icons";
import { useRouter } from "vue-router";
import { DbService } from "@/providers/database-service";
import { inject, ref, Ref } from "vue";
import { CarService } from "@/providers/cars-service";
import { Car } from "@/models/Car";
import { Capacitor } from "@capacitor/core";
import { Filesystem } from "@capacitor/filesystem";
const router = useRouter();

const loadImages = ref<(string | null | undefined)[]>();
const onClick = (id: number) => {
  router.push({
    name: "CarDetailsView",
    params: {
      id,
    },
  });
};

const onAddClick = () => {
  router.push({ name: "AddNewCarView" });
};

const cars = ref<Car[]>([]);

const loadCars = async () => {
  if (dbService) {
    const carService = new CarService(dbService.value);
    await carService.createTableIfNotExist();
    const res = await carService.getAllCars();
    if (res) cars.value = res;
    console.log(res);
  }
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

const dbService: Ref<DbService> | undefined = inject(`dbService`);
onIonViewDidEnter(async () => {
  await loadCars();
  const proms = cars.value.map((val) =>
    val.filePath ? getImage(val.filePath) : undefined
  );
  loadImages.value = await Promise.all(proms);
});
</script>

<style scoped>
.card-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns of equal width */
  gap: 2px;
}
</style>

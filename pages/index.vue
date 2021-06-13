<template>
  <div class="bg-red-100 h-screen pt-3">
    <div
      class="
        wrapper
        m-5
        p-5
        container
        mx-auto
        border-solid border-4 border-pink-600
        rounded
        bg-gray-100
      "
    >
      <h1 class="text-xl text-center font-mono pb-4 font-bold" id="title">
        Omegas EM-tippekonkurranse
      </h1>
      <p class="text-base font-mono mx-10">
        Endelig skal de store spørsmål her i livet besvares:
      </p>
      <div class="mt-5 ml-14">
        <ul class="list-disc font-mono">
          <li>Hvem i Omega er best til å tippe?</li>
          <li>Hvilket europeisk land er best til å spille fotball?</li>
        </ul>
      </div>
      <h2 class="text-center pb-2 text-lg font-mono mt-5 font-bold">
        Rangering:
      </h2>
      <div class="mx-8">
        <ol v-for="result in results" :key="result.point" class="mx-10">
          <li class="font-mono">{{ result.name }}: {{ result.points }}</li>
        </ol>
      </div>
      <p class="text-center font-mono font-extralight">
        Sist oppdatert: {{ lastUpdate }}
      </p>
    </div>
  </div>
</template>

import { A } from '@solidjs/router';
import type { Component } from 'solid-js';

const App: Component = () => {
  return (
    <div class='flex h-screen flex-col items-center gap-4 pt-[25vh] font-mono'>
      <h1 class='text-3xl font-semibold'>Führer Editor</h1>
      <A href='/post' class='text-md bg-[#007a55] px-3 py-1.5 text-white hover:bg-[#005c40]/80'>
        Open sandbox
      </A>
    </div>
  );
};

export default App;

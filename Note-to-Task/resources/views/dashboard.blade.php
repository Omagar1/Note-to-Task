<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tailwind + Alpine Test</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-100 p-10">

    <h1 class="text-4xl font-bold text-blue-600 mb-6">Tailwind & Alpine Test</h1>

    <!-- Tailwind styling test -->
    <div class="p-6 bg-white shadow rounded mb-6">
        <p class="text-gray-700 text-lg">
            If this box is white with a shadow and text is gray, Tailwind is working ✅
        </p>
    </div>

    <!-- Alpine toggle test -->
    <div x-data="{ open: false }" class="p-6 bg-white shadow rounded">
        <button 
            @click="open = !open"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
            Toggle Message
        </button>

        <p x-show="open" 
            class="mt-4 text-gray-800 font-semibold transition duration-300"
        >
            Alpine is working ✅
        </p>
    </div>

    <!-- Optional: Alpine multiple state test -->
    <div x-data="{ count: 0 }" class="mt-6 p-6 bg-white shadow rounded">
        <button 
            @click="count++"
            class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
            Click Me
        </button>
        <p class="mt-4 text-gray-800">Button clicked: <span x-text="count"></span> times</p>
    </div>

</body>
</html>
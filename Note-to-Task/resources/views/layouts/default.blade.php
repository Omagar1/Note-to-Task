<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Note to Task</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>

    <body class="w-full h-hull">
        <header>
            @yield('header')
        </header>

        <main class = " w-full h-full box-content size-32 border-4 p-4 ">
            @yield('mainContent')
        </main>

        <footer class = "bg-gray-800 text-white text-center py-4">
            @yield('footer')
        </footer>
    </body>
</html>
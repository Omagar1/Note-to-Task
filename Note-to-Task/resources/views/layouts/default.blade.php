<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Note to Task</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>

    <body>
        <header>
            @yield('header')
        </header>

        <main>
            @yield('mainContent')
        </main>

        <footer class = "bg-gray-800 text-white text-center py-4">
            @yield('footer')
        </footer>
    </body>
</html>
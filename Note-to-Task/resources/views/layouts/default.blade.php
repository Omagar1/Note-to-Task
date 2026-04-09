<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Note to Task</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <!-- quill text editor stuff -->
        <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
        <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>

    </head>

    <body class="w-full h-hull">
        <header>
            @yield('header')
        </header>

        @auth
            <main class = "grid grid-cols-1 gap-4 p-4 sm:mx-8">
        @endauth
        @guest
            <main class = "grid grid-cols-1 gap-4 p-4 sm:mx-8 md:mx-16 md:mt-10 lg:mx-32 lg:mt-20 xl:mx-64 xl:mt-20 2xl:mx-96 2xl:mt-20 shadow-2xl">
        @endguest
    
            @yield('mainContent')
        </main>

        <footer class = "absolute bottom-0 bg-gray-800 text-white text-center py-4">
            @yield('footer')
        </footer>
    </body>
</html>
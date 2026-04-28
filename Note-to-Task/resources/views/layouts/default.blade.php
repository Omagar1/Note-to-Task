<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>Note to Task</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <!-- tinyMCE text editor stuff -->
        @yield('headExtras')

    </head>

    <body class="w-screen h-screen">
        <header>
            @yield('header')
        </header>
        <div class="flex flex-col min-h-screen">
        @auth
        <main class = "flex-grow gap-4 p-4 sm:mx-8 h-full">
                @yield('mainContent')
        </main>
        @endauth

        @guest
        <main class = "gap-4 p-4 sm:mx-8 md:mx-16 md:mt-10 lg:mx-32 lg:mt-20 xl:mx-64 xl:mt-20 2xl:mx-96 2xl:mt-20 shadow-2xl ">
                @yield('mainContent')
        </main>
        <div class="flex-grow">
            <!-- filler  -->
        </div>
        @endguest
    
        

        <footer class = "bottom-0 w-full bg-gray-800 text-white text-center py-4">
            @yield('footer')
        </footer>
        </div>
    </body>
</html>
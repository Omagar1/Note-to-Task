<nav class="bg-gray-800 p-4">
    <div class="container mx-auto flex items-center justify-between">
        @auth
            <p class="text-white text-lg font-semibold">Note to Task</p>
            <div>
                <a href="{{ route('dashboard') }}" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="{{ route('settings') }}" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Settings</a>
                <form action="{{ route('logout') }}" method="POST" class="inline">
                    @csrf
                    <button type="submit" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Logout</button>
                </form>
            </div>
        @endauth

        @guest
            <p class="text-white text-lg font-semibold">Note to Task</p>
            <div>
                <a href="{{ route('login') }}" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</a>
                <a href="{{ route('signup') }}" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Sign up</a>
                <a href="{{ route('about') }}" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</a>
            </div>
            
        @endguest
    </div>



        
</nav>
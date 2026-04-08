<nav class="bg-gray-800 p-4">
    <div class="container mx-auto flex items-center justify-between">
        @auth
            <div x-data x-show="$store.savingElement.isShown" class="text-white text-lg bg-green-500 font-semibold flex items-center space-x-2">
                <p class="text-white text-lg font-semibold">saving</p>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" class="size-5 fill-success motion-safe:animate-spin dark:fill-success">
                    <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
                    <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" />
                </svg>
            </div>
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
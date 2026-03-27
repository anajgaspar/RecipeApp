import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Feather from '@expo/vector-icons/Feather';
import Pantry from "../../pantry/screens/Pantry";
import Profile from "../../social/screens/Profile";
import Planning from "../../planning/screens/Planning";
import Search from "../../search/screens/Search";

export default function BottomBar() {
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Início') iconName = 'home';
                    else if (route.name === 'Search') iconName = 'search';
                    else if (route.name === 'Planning') iconName = 'calendar';
                    else if (route.name === 'Pantry') iconName = 'archive';
                    else if (route.name === 'Social') iconName = 'users';
                    
                    return <Feather name={iconName as any} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#f97316',
                tabBarInactiveTintColor: '#9ca3af',
            })}
        >
            <Tab.Screen
                name="Início"
                component={Home}
                options={{ tabBarLabel: 'Início' }}
            />
            <Tab.Screen
                name="Search"
                component={Search}
                options={{ tabBarLabel: 'Busca' }}
            />
            <Tab.Screen
                name="Pantry"
                component={Pantry}
                options={{ tabBarLabel: 'Despensa' }}
            />
            <Tab.Screen
                name="Planning"
                component={Planning}
                options={{ tabBarLabel: 'Planejamento' }}
            />
            <Tab.Screen
                name="Social"
                component={Profile}
                options={{ tabBarLabel: 'Social' }}
            />
        </Tab.Navigator>
    )
}
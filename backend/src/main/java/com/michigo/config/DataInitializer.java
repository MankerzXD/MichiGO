package com.michigo.config;

import com.michigo.model.entity.CatCatch;
import com.michigo.model.entity.User;
import com.michigo.model.enums.Rarity;
import com.michigo.repository.CatCatchRepository;
import com.michigo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CatCatchRepository catCatchRepository;

    public DataInitializer(UserRepository userRepository, CatCatchRepository catCatchRepository) {
        this.userRepository = userRepository;
        this.catCatchRepository = catCatchRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // Usuario Entrenador Principal
            User trainer = new User(
                    "michimaster",
                    "Ash Kétchup & Michis",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                    "Buscador de michis legendarios en techos y callejones. Nivel Maestro."
            );
            trainer.setLevel(3);
            trainer.setExperience(1250);
            User savedTrainer = userRepository.save(trainer);

            // Semilla de Michis iniciales para poblar el mapa
            CatCatch cat1 = new CatCatch(
                    savedTrainer,
                    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
                    -34.6037, -58.3816, // Obelisco / Plaza
                    "Don Bigotes de la Mancha",
                    "Tuxedo Elegante con Pajarita",
                    "Juzga la impuntualidad de los transeúntes con su mirada seria.",
                    Rarity.RARO,
                    "Mirada de Desdén Aristocrático"
            );

            CatCatch cat2 = new CatCatch(
                    savedTrainer,
                    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80",
                    -34.6080, -58.3750,
                    "Señor Naranjo el Caótico",
                    "Atigrado Naranja Silvestre",
                    "Corre a toda velocidad sin destino aparente. Una sola neurona, pero feliz.",
                    Rarity.COMUN,
                    "Derrape Nocturno en Pasillos"
            );

            CatCatch cat3 = new CatCatch(
                    savedTrainer,
                    "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80",
                    -34.5990, -58.3900,
                    "Michi Cósmico Ojos de Jade",
                    "Carey Místico Tricolor",
                    "Protege el portal dimensional del contenedor de reciclaje.",
                    Rarity.LEGENDARIO,
                    "Ronroneo Hipnótico Galáctico"
            );

            catCatchRepository.save(cat1);
            catCatchRepository.save(cat2);
            catCatchRepository.save(cat3);

            System.out.println("✅ Base de datos H2 inicializada con éxito con usuario y michis de demostración.");
        }
    }
}

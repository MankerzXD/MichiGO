package com.michigo.repository;

import com.michigo.model.entity.CatCatch;
import com.michigo.model.enums.Rarity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatCatchRepository extends JpaRepository<CatCatch, Long> {

    List<CatCatch> findAllByOrderByCapturedAtDesc();

    List<CatCatch> findByUserIdOrderByCapturedAtDesc(Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndRarity(Long userId, Rarity rarity);
}
